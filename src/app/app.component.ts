import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { ButtplugControlPanelComponent } from './component/buttplug-control-panel.component';
import { UploadContainerComponent } from './component/container/upload-container/upload-container.component';
import { PlaybackContainerComponent } from './component/container/playback-container/playback-container.component';
import { AngularRoastModule } from 'ngx-roast-me';
import { NzModalService } from "ng-zorro-antd/modal";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NzCardComponent,
    ButtplugControlPanelComponent,
    UploadContainerComponent,
    PlaybackContainerComponent,
    AngularRoastModule,
  ],
  providers: [NzModalService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  displayMode: 'standard' | 'minimal' = 'standard';

  constructor() {
    if (window.innerWidth < 768) {
      this.displayMode = 'minimal';
    }
  }

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
