import { NgModule } from '@angular/core';
import { VimeModule } from '@vime/angular';
import { VideoPlayerComponent } from './video-player.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [VideoPlayerComponent],
  imports: [CommonModule, VimeModule],
  exports: [VideoPlayerComponent],
})
export class VideoPlayerModule {}
