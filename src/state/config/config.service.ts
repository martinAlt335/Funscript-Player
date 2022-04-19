import { Injectable } from '@angular/core';
import { ConfigRepository } from './config.repository';
import { ConfigState } from '../../interface/configState';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  constructor(private configR: ConfigRepository) {}

  patchConfig(config: ConfigState): void {
    this.configR.store.update((s) => ({
      ...s,
      ...config,
    }));
  }
}
