import { Component } from '@angular/core';
import { UserInputService } from '../load/load-video/user-input.service';

@Component({
  selector: 'app-user-flow',
  templateUrl: './user-flow.component.html',
  styleUrls: ['./user-flow.component.scss'],
})
export class UserFlowComponent {
  constructor(public userInputService: UserInputService) {}

  mode: 'video' | 'script' = 'script';

  handleEvent(event: 'video' | 'script'): void {
    this.mode = event;
  }
}
