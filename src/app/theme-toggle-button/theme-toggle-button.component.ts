import {Component} from '@angular/core';
import {ThemeService} from '../theme.service';

@Component({
  selector: 'app-theme-toggle-button',
  templateUrl: './theme-toggle-button.component.html',
  styleUrls: ['./theme-toggle-button.component.scss']
})
export class ThemeToggleButtonComponent {
  constructor(public themeService: ThemeService) {
  }
}
