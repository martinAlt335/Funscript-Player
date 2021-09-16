import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoPlayerModule } from './video-player/video-player.module';
import { MatButtonModule } from '@angular/material/button';
import { VideoSelectComponent } from './video-select/video-select.component';

@NgModule({
  declarations: [AppComponent, VideoSelectComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    VideoPlayerModule,
    MatButtonModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
