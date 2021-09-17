import {Component} from '@angular/core';
import {ButtplugService} from './buttplug.service';

@Component({
  selector: 'app-buttplug',
  templateUrl: './buttplug.component.html',
  styleUrls: ['./buttplug.component.scss'],
})
export class ButtplugComponent {
  constructor(public buttPlug: ButtplugService) {}
}
