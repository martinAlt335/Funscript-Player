import {Component} from '@angular/core';
import {UserInputService} from './user-input/user-input.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'funscript-player';

  constructor(public userInputService: UserInputService) {
  }
}
