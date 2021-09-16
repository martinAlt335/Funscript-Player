import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoPlayerModule } from './video-player/video-player.module';
import { MatButtonModule } from '@angular/material/button';
import { UserInputComponent } from './user-input/user-input.component';
import { ButtplugComponent } from './buttplug/buttplug.component';
import { HotToastModule } from '@ngneat/hot-toast';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [AppComponent, UserInputComponent, ButtplugComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    VideoPlayerModule,
    MatButtonModule,
    MatInputModule,
    HotToastModule.forRoot(),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
