import { Injectable } from '@angular/core';

export interface DevicePreference {
  enabled: boolean;
  useVibrate: boolean;
  useRotate: boolean;
  useLinear: boolean;
}

@Injectable({ providedIn: 'root' })
export class DevicePreferencesService {
  // Keyed by device index
  private preferences: Record<number, DevicePreference> = {};

  setPreference(deviceIndex: number, pref: DevicePreference) {
    this.preferences[deviceIndex] = pref;
  }

  getPreferences(): Record<number, DevicePreference> {
    return this.preferences;
  }
}
