import { Component, OnInit } from '@angular/core';
import { UserInputService } from './components/load/load-video/user-input.service';
import { UntilDestroy } from '@ngneat/until-destroy';
import { environment } from '../environments/environment';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'funscript-player';

  constructor(public userInputService: UserInputService) {}

  ngOnInit(): void {
    this.startUsage();
  }

  startUsage(): void {
    const script = document.createElement('script');
    script.src = 'https://umami-five-dusky.vercel.app/usage.js';
    script.defer = true;
    script.setAttribute('data-website-id', environment.websiteId);
    document.head.appendChild(script);
  }
}
