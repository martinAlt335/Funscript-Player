import {NgModule} from '@angular/core';
import {VimeModule} from '@vime/angular';
import {VideoPlayerComponent} from './video-player.component';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [VideoPlayerComponent],
  imports: [CommonModule, VimeModule, MatButtonModule],
  exports: [VideoPlayerComponent],
})
export class VideoPlayerModule {}
