import { Injectable } from "@angular/core";
import { createStore, select, Store, withProps } from "@ngneat/elf";
import { Observable } from "rxjs";
import { localStorageStrategy, persistState } from "@ngneat/elf-persist-state";

export enum ConnectionType {
  External = "external",
  Local = "local",
}

export interface HotkeyConfig {
  togglePlayback: string;
  toggleDevices: string;
}

export interface ConfigState {
  deviceResponseDelayMs: number;
  externalUrl: string;
  scriptTimingOffsetMs: number;
  selectedConnectionType: ConnectionType;
  sendActionsEnabled: boolean;
  strokeRange: number;
  hotkeys: HotkeyConfig;
}

@Injectable({ providedIn: "root" })
export class ConfigRepository {
  store: Store<any, ConfigState>;

  deviceResponseDelayMs$!: Observable<number>;
  externalUrl$!: Observable<string>;
  scriptTimingOffsetMs$!: Observable<number>;
  selectedConnectionType$!: Observable<"external" | "local">;
  sendActionsEnabled$!: Observable<boolean>;
  strokeRange$!: Observable<number>;
  hotkeys$!: Observable<HotkeyConfig>;

  constructor() {
    this.store = this.createStore();
    this.persistState();

    this.deviceResponseDelayMs$ = this.store.pipe(
      select((state) => state.deviceResponseDelayMs)
    );
    this.externalUrl$ = this.store.pipe(select((state) => state.externalUrl));
    this.scriptTimingOffsetMs$ = this.store.pipe(
      select((state) => state.scriptTimingOffsetMs)
    );
    this.selectedConnectionType$ = this.store.pipe(
      select((state) => state.selectedConnectionType)
    );
    this.sendActionsEnabled$ = this.store.pipe(
      select((state) => state.sendActionsEnabled)
    );
    this.strokeRange$ = this.store.pipe(select((state) => state.strokeRange));
    this.hotkeys$ = this.store.pipe(select((state) => state.hotkeys));
  }

  get externalUrl() {
    return this.store.query((state) => state.externalUrl);
  }

  get selectedConnectionType() {
    return this.store.query((state) => state.selectedConnectionType);
  }

  get sendActionsEnabled() {
    return this.store.query((state) => state.sendActionsEnabled);
  }

  get hotkeys() {
    return this.store.query((state) => state.hotkeys);
  }

  createStore() {
    return createStore(
      { name: "config" },
      withProps<ConfigState>({
        externalUrl: "ws://localhost:12345",
        sendActionsEnabled: true,
        selectedConnectionType: ConnectionType.Local,
        scriptTimingOffsetMs: -200,
        strokeRange: 100,
        deviceResponseDelayMs: 0,
        hotkeys: {
          togglePlayback: "space",
          toggleDevices: "shift.d"
        }
      })
    );
  }

  persistState() {
    persistState(this.store, {
      key: "config",
      storage: localStorageStrategy,
    });
  }

  updateState(config: Partial<ConfigState>): void {
    this.store.update((state) => ({
      ...state,
      ...config,
    }));
  }

  updateHotkey(key: keyof HotkeyConfig, value: string): void {
    this.store.update((state) => ({
      ...state,
      hotkeys: {
        ...state.hotkeys,
        [key]: value
      }
    }));
  }
}
