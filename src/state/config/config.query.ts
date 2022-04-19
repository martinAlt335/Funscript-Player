import { Injectable } from '@angular/core';
import { select } from '@ngneat/elf';
import { ConfigRepository } from './config.repository';

@Injectable({ providedIn: 'root' })
export class ConfigQuery {
  config$ = this.configR.store.pipe();

  command$ = this.configR.store.pipe(select((key) => key.command));

  constructor(private configR: ConfigRepository) {}
}
