import { Component } from '@angular/core';
import { UserInputService } from './components/load/load-video/user-input.service';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'funscript-player';

  constructor(public userInputService: UserInputService) {}
}
