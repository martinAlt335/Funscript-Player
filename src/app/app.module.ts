import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {VideoPlayerModule} from './video-player/video-player.module';
import {MatButtonModule} from '@angular/material/button';
import {UserInputComponent} from './user-input/user-input.component';
import {ButtplugComponent} from './buttplug/buttplug.component';
import {HotToastModule} from '@ngneat/hot-toast';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FunscriptHeatmapModule} from './funscript-heatmap/funscript-heatmap.module';

@NgModule({
  declarations: [AppComponent, UserInputComponent, ButtplugComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    VideoPlayerModule,
    MatButtonModule,
    MatInputModule,
    HotToastModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    FunscriptHeatmapModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
