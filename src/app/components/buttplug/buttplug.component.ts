import { Component, ViewContainerRef } from '@angular/core';
import { ButtplugService } from '../../core/services/buttplug/buttplug.service';
import { ModalService } from '../../core/services/modal/modal.service';
import { SettingsModalComponent } from '../settings/settings-modal/settings-modal.component';

@Component({
  selector: 'app-buttplug-control-panel',
  templateUrl: './buttplug.component.html',
  styleUrls: ['./buttplug.component.scss'],
})
export class ButtplugComponent {
  readonly SettingsModalComponent = SettingsModalComponent;

  constructor(
    public buttPlug: ButtplugService,
    public modalService: ModalService,
    public viewContainerRef: ViewContainerRef
  ) {}
}
