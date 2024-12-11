import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FunscriptUploadComponent } from '../../pure/funscript-upload/funscript-upload.component';
import { VideoUploadComponent } from '../../pure/video-upload/video-upload.component';
import { FunscriptActionService } from '../../../service/funscript-action.service';
import { PlaybackStateService } from '../../../service/playback-state.service';

@Component({
  selector: 'app-upload-container',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    FunscriptUploadComponent,
    VideoUploadComponent,
  ],
  templateUrl: './upload-container.component.html',
  styleUrls: ['./upload-container.component.scss'],
})
export class UploadContainerComponent {
  constructor(
    private funscriptService: FunscriptActionService,
    private playbackState: PlaybackStateService
  ) {}

  onFunscriptUploaded(event: { fileName: string; funscript: any }) {
    if (event.funscript) {
      this.funscriptService.loadFunscript(event.funscript);
    }
  }

  onVideoSelected(event: { fileName?: string; videoUrl: string }) {
    if (event.videoUrl) {
      this.playbackState.setVideoUrl(event.videoUrl);
    }
  }

  onFunscriptDeleted(): void {
    this.funscriptService.removeFunscript();
  }

  onVideoDeleted(): void {
    this.playbackState.setVideoUrl('');
  }
}
