import { Injectable } from "@angular/core";
import { Funscript } from "funscript-utils/lib/types";
import { Action } from "funscript-utils/src/types";
import { BehaviorSubject, Observable } from "rxjs";
import { ButtplugService } from "./buttplug.service";
import { DevicePreferencesService } from "./device-preferences.service";
import { ConfigRepository } from "../state/config/config.repository";

@Injectable({
  providedIn: "root",
})
export class FunscriptActionService {
  private actions: Action[] = [];
  private lastActionIndex = -1;

  private funscriptDurationSubject = new BehaviorSubject<number>(0);
  public funscriptDuration$: Observable<number> =
    this.funscriptDurationSubject.asObservable();

  private currentFunscriptSubject = new BehaviorSubject<Funscript | undefined>(
    undefined
  );
  public currentFunscript$ = this.currentFunscriptSubject.asObservable();

  constructor(
    private configRepo: ConfigRepository,
    private buttplugService: ButtplugService,
    private devicePreferencesService: DevicePreferencesService
  ) {}

  loadFunscript(funscript: Funscript): void {
    if (funscript && funscript.actions && funscript.actions.length > 0) {
      this.actions = [...funscript.actions].sort((a, b) => a.at - b.at);
      this.lastActionIndex = -1;
      const duration = funscript.actions[funscript.actions.length - 1].at;
      this.funscriptDurationSubject.next(duration);
      this.currentFunscriptSubject.next(funscript);
    }
  }

  removeFunscript() {
    this.actions = [];
    this.funscriptDurationSubject.next(0);
    this.currentFunscriptSubject.next(undefined);
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

    // Read strokeRange from config and scale
    const strokeRange = this.configRepo.store.query(
      (state) => state.strokeRange
    );
    const strokeScale = strokeRange / 100.0;
    position = position * strokeScale;

    // Vibrate/rotate speed is still based purely on position
    const speed = Math.min(1, Math.max(0, currentAction.pos / 100));

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
      console.error("Error sending action to device:", err);
    }
  }

  private getCurrentOffset(): number {
    return this.configRepo.store.query((state) => state.scriptTimingOffsetMs);
  }
}
