import { Injectable } from '@angular/core';
import { createStore, select, Store, withProps } from '@ngneat/elf';
import { Observable } from 'rxjs';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';

export enum ConnectionType {
  External = 'external',
  Local = 'local',
}

export interface ConfigState {
  externalUrl: string;
  sendActionsEnabled: boolean;
  selectedConnectionType: ConnectionType; // New Property
}

@Injectable({ providedIn: 'root' })
export class ConfigRepository {
  store: Store<any, ConfigState>;
  sendActionsEnabled$!: Observable<boolean>;
  externalUrl$!: Observable<string>;
  selectedConnectionType$!: Observable<'external' | 'local'>; // New Observable

  constructor() {
    this.store = this.createStore();
    this.persistState();
    this.sendActionsEnabled$ = this.store.pipe(
      select((state) => state.sendActionsEnabled)
    );
    this.externalUrl$ = this.store.pipe(select((state) => state.externalUrl));
    this.selectedConnectionType$ = this.store.pipe(
      select((state) => state.selectedConnectionType)
    );
  }

  get sendActionsEnabled() {
    return this.store.query((state) => state.sendActionsEnabled);
  }

  get selectedConnectionType() {
    return this.store.query((state) => state.selectedConnectionType);
  }

  createStore() {
    return createStore(
      { name: 'config' },
      withProps<ConfigState>({
        externalUrl: 'ws://localhost:12345',
        sendActionsEnabled: true,
        selectedConnectionType: ConnectionType.Local,
      })
    );
  }

  persistState() {
    persistState(this.store, {
      key: 'config',
      storage: localStorageStrategy,
    });
  }

  updateState(config: Partial<ConfigState>): void {
    this.store.update((state) => ({
      ...state,
      ...config,
    }));
  }
}
