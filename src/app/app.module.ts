import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoPlayerModule } from './video-player/video-player.module';
import { MatButtonModule } from '@angular/material/button';
import { UserInputComponent } from './user-input/user-input.component';
import { ButtplugComponent } from './buttplug/buttplug.component';

@NgModule({
  declarations: [AppComponent, UserInputComponent, ButtplugComponent],
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
