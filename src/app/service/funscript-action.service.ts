import { Injectable } from '@angular/core';
import { Funscript } from 'funscript-utils/lib/types';
import { Action } from 'funscript-utils/src/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { ButtplugService } from './buttplug.service';
import { DevicePreferencesService } from './device-preferences.service';
import { ConfigRepository } from '../state/config/config.repository';

@Injectable({
  providedIn: 'root',
})
export class FunscriptActionService {
  private actions: Action[] = [];
  private lastActionIndex = -1;
  private latencyCompensationMs = 50;

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
    this.actions = [];
    this.funscriptDurationSubject.next(0);
    this.currentFunscriptSubject.next(undefined);
  }

  checkTime(currentTimeMs: number): void {
    if (!this.actions.length) return;

    const compensatedTime = currentTimeMs + this.latencyCompensationMs;
    const actionIndex = this.findActionIndexForTime(compensatedTime);

    if (actionIndex !== -1 && actionIndex !== this.lastActionIndex) {
      const action = this.actions[actionIndex];
      this.dispatchAction(action, compensatedTime).then();
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

  private async dispatchAction(
    action: Action,
    compensatedTime: number
  ): Promise<void> {
    if (!this.configRepo.sendActionsEnabled) {
      return;
    }

    const speed = Math.min(1.0, Math.max(0, action.pos / 100));
    const position = Math.min(1.0, Math.max(0, action.pos / 100));

    try {
      const devices = this.buttplugService.getDevices();
      const preferences = this.devicePreferencesService.getPreferences();

      for (const device of devices) {
        const devicePref = preferences[device.index];
        if (!devicePref?.enabled) continue;

        if (device.canVibrate && devicePref.useVibrate) {
          await this.buttplugService.vibrateDevice(device.index, speed);
        }

        if (device.canRotate && devicePref.useRotate) {
          await this.buttplugService.rotateDevice(device.index, speed, true);
        }

        if (device.canLinear && devicePref.useLinear) {
          await this.buttplugService.linearDevice(device.index, position, 500);
        }
      }
    } catch (e) {
      console.error('Error sending action to device:', e);
    }
  }
}
