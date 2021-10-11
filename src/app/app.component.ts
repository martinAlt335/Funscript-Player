import {Component} from '@angular/core';
import {UserInputService} from './user-input/user-input.service';
import {ThemeService} from './theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'funscript-player';

  constructor(public userInputService: UserInputService, private themeService: ThemeService) {
    this.themeService.load();
  }
}
