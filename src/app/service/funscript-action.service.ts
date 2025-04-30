import { Injectable } from "@angular/core";
import { Funscript } from "funscript-utils/lib/types";
import { Action } from "funscript-utils/src/types";
import { BehaviorSubject, Observable } from "rxjs";
import { ButtplugService } from "./buttplug.service";
import { DevicePreferencesService } from "./device-preferences.service";
import { ConfigRepository } from "../state/config/config.repository";
import { DiagnosticService } from "ngx-roast-me";
import { FunscriptChangedEvent } from "../interface/funscript-changed-event.interface";

@Injectable({
  providedIn: "root",
})
export class FunscriptActionService {
  public invertFunscriptActions = false;

  private actions: Action[] = [];
  private lastActionIndex = -1;

  // Subjects & Observables
  private funscriptSubject = new BehaviorSubject<FunscriptChangedEvent>({
    funscript: undefined,
    source: 'upload'
  });
  private durationSubject = new BehaviorSubject<number>(0);

  public funscript$ = this.funscriptSubject.asObservable();
  public duration$: Observable<number> = this.durationSubject.asObservable();

  constructor(
    private configRepo: ConfigRepository,
    private buttplugService: ButtplugService,
    private devicePreferencesService: DevicePreferencesService,
    private diagnosticService: DiagnosticService,
  ) {}

  loadFunscript(funscript: Funscript, source: 'upload' | 'edit' = 'upload'): void {
    if (funscript && funscript.actions && funscript.actions.length > 0) {
      this.actions = [...funscript.actions].sort((a, b) => a.at - b.at);
      this.lastActionIndex = -1;
      const duration = funscript.actions[funscript.actions.length - 1].at;
      this.durationSubject.next(duration);
      this.funscriptSubject.next({ funscript, source });
    }
  }

  removeFunscript() {
    this.actions = [];
    this.durationSubject.next(0);
    this.funscriptSubject.next({ funscript: undefined, source: 'upload'});
  }

  checkTime(currentTimeMs: number): void {
    if (!this.actions.length) return;

    const offset = this.getCurrentOffset();
    const compensatedTime = currentTimeMs + offset;
    const actionIndex = this.findActionIndexForTime(compensatedTime);

    if (actionIndex !== -1 && actionIndex !== this.lastActionIndex) {
      const action = this.actions[actionIndex];
      this.dispatchAction(action).then();
      this.lastActionIndex = actionIndex;
    }
  }

  reset(): void {
    this.lastActionIndex = -1;
  }

  private findActionIndexForTime(currentMs: number): number {
    let low = 0;
    let high = this.actions.length - 1;
    let bestIndex = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.actions[mid].at <= currentMs) {
        bestIndex = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return bestIndex;
  }

  private async dispatchAction(currentAction: Action): Promise<void> {
    if (!this.configRepo.sendActionsEnabled) {
      return;
    }

    // Find index of current action
    const currentIndex = this.actions.indexOf(currentAction);
    if (currentIndex < 0) {
      return;
    }

    // Determine stroke duration from time difference to the next action
    let strokeDurationMs = 500; // Default fallback if there's no "next" action
    if (currentIndex < this.actions.length - 1) {
      const nextAction = this.actions[currentIndex + 1];
      const rawGapMs = nextAction.at - currentAction.at;

      // Gather device response delay from config
      const deviceResponseDelayMs = this.configRepo.store.query(
        (state) => state.deviceResponseDelayMs
      );
      // Add deviceResponseDelayMs to the raw gap
      strokeDurationMs = Math.max(0, rawGapMs + deviceResponseDelayMs);
    }

    // Convert “pos” range to 0..1
    let position = Math.min(1, Math.max(0, currentAction.pos / 100));

    // Apply inversion if enabled
    if (this.invertFunscriptActions) {
      position = 1 - position;
    }

    // Read strokeRange from config and scale
    const strokeRange = this.configRepo.store.query(
      (state) => state.strokeRange
    );
    const strokeScale = strokeRange / 100.0;
    position = position * strokeScale;

    // For vibrate devices: if same pos as the previous action => speed=0, else speed=pos/100
    let speed = Math.min(1, Math.max(0, currentAction.pos / 100));
    if (currentIndex > 0) {
      let prevPos = this.actions[currentIndex - 1].pos;
      if (Math.abs(currentAction.pos - prevPos) < 0.00001) {
        speed = 0;
      }
    }

    try {
      const devices = this.buttplugService.getDevices();
      const prefs = this.devicePreferencesService.getPreferences();

      for (const device of devices) {
        const devicePref = prefs[device.index];
        if (!devicePref || !devicePref.enabled) continue;

        // Vibrate
        if (device.canVibrate && devicePref.useVibrate) {
          await this.buttplugService.vibrateDevice(device.index, speed);
        }

        // Rotate
        if (device.canRotate && devicePref.useRotate) {
          await this.buttplugService.rotateDevice(device.index, speed, true);
        }

        // Linear
        if (device.canLinear && devicePref.useLinear) {
          await this.buttplugService.linearDevice(
            device.index,
            position,
            strokeDurationMs
          );
        }
      }
    } catch (err) {
      this.diagnosticService.logError("Error sending action to device:", err);
    }
  }

  private getCurrentOffset(): number {
    return this.configRepo.store.query((state) => state.scriptTimingOffsetMs);
  }
}
