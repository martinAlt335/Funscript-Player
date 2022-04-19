import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfigRepository } from '../../../../state/config/config.repository';
import { ConfigService } from '../../../../state/config/config.service';
import { Command } from '../../../../interface/configState';
import { Hotkeys } from '../../../core/services/hotkeys/hotkeys.service';

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsModalComponent {
  hotkeysArr = Array.from(this.hotkeys.hotkeys);
  radioValue = this.configR.store.getValue().command;

  constructor(
    private hotkeys: Hotkeys,
    private configR: ConfigRepository,
    private configS: ConfigService
  ) {}

  modelChange(event: Command): void {
    this.configS.patchConfig({ command: event });
  }
}
