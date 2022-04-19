import { Injectable } from '@angular/core';
import { createState, Store, withProps } from '@ngneat/elf';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';
import { ConfigState } from '../../interface/configState';

@Injectable({ providedIn: 'root' })
export class ConfigRepository {
  store: Store<any, ConfigState>;

  constructor() {
    const { state, config } = createState(
      withProps<ConfigState>({
        command: 'linear',
      })
    );
    this.store = new Store({ name: 'config', state, config });
    persistState(this.store, {
      key: 'config',
      storage: localStorageStrategy,
    });
  }
}
