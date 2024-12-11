import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MimeTypes,
  VideoPlayerComponent,
} from '../video-player/video-player.component';
import {
  NzUploadChangeParam,
  NzUploadComponent,
  NzUploadFile,
} from 'ng-zorro-antd/upload';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { NzIconDirective, NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzDividerComponent } from 'ng-zorro-antd/divider';

enum VideoSourceType {
  Url = 'url',
  File = 'file',
  Dlna = 'dlna',
}

@Component({
  selector: 'app-video-player-manager',
  standalone: true,
  imports: [
    CommonModule,
    VideoPlayerComponent,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    FormsModule,
    NzIconDirective,
    NzUploadComponent,
    NzCardComponent,
    NzDividerComponent,
  ],
  templateUrl: './video-player-manager.component.html',
  styleUrls: ['./video-player-manager.component.scss'],
})
export class VideoPlayerManagerComponent {
  videoSourceType?: VideoSourceType;
  @Input() sourceUrl: string = '';
  fileUrl?: string;
  selectedFile?: NzUploadFile;
  selectedMimeType!: MimeTypes;

  @Output() currentTimeMs = new EventEmitter<number>();
  @Output() paused = new EventEmitter<void>();

  onUrlSubmit(): void {
    this.videoSourceType = VideoSourceType.Url;
    this.selectedMimeType = this.getMimeTypeFromUrl(this.sourceUrl);
  }

  handleChange({ file, fileList }: NzUploadChangeParam): void {
    const status = file.status;

    if (status === 'done' || status === 'uploading') {
      if (file) {
        this.videoSourceType = VideoSourceType.File;
        this.selectedFile = file;
        this.fileUrl = URL.createObjectURL(file.originFileObj!);
        this.selectedMimeType = file.type as any;
      }
    }
  }

  handleVideoTimeUpdate(timeUpdate: number) {
    this.currentTimeMs.emit(timeUpdate);
  }

  /**
   * **New Handler for Pause Event**
   * This method will be called when the video is paused.
   */
  handlePause(): void {
    this.paused.emit();
  }

  get videoSourceUrl(): string | undefined {
    if (this.videoSourceType === VideoSourceType.Url) {
      return this.sourceUrl;
    } else if (this.videoSourceType === VideoSourceType.File) {
      return this.fileUrl;
    }
    return undefined;
  }

  private getMimeTypeFromUrl(url: string): MimeTypes {
    if (url.endsWith('.m3u8')) {
      return MimeTypes.HLS;
    } else if (url.endsWith('.mp4')) {
      return MimeTypes.MP4;
    }
    return MimeTypes.STREAM;
  }
}
