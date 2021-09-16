import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { VideoSelectService } from './video-select.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-video-select',
  templateUrl: './video-select.component.html',
  styleUrls: ['./video-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoSelectComponent {
  @ViewChild('videoInput')
  videoInput: any;
  @ViewChild('fsFileInput')
  fsFileInput: any;

  video: File | null = null;
  fs: File | null = null;

  constructor(private videoService: VideoSelectService) {}

  onClickFileInputButton(type: 'video' | 'funscript'): void {
    if (type === 'video') {
      this.videoInput.nativeElement.click();
    }

    if (type === 'funscript') {
      this.fsFileInput.nativeElement.click();
    }
  }

  onChangeFileInput(type: 'video' | 'funscript'): void {
    if (type === 'video') {
      const files: { [key: string]: File } =
        this.videoInput.nativeElement.files;
      this.video = files[0];
      const videoURL = URL.createObjectURL(files[0]);
      return this.videoService.videoURL.next(videoURL);
    }

    if (type === 'funscript') {
      const files: { [key: string]: File } =
        this.fsFileInput.nativeElement.files;
      this.fs = files[0];
      this.fileToJSON(files[0]).then((r) => console.log(r));
    }
  }

  // load user uploaded funscript file into a parsed object.
  private fileToJSON(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      // @ts-ignore
      fileReader.onload = (event) => resolve(JSON.parse(event.target.result));
      fileReader.onerror = (error) => reject(error);
      fileReader.readAsText(file);
    });
  }
}
