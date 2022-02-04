import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UserInputService } from './user-input.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationsService } from '../notifications.service';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Funscript } from 'funscript-utils/lib/types';

@UntilDestroy()
@Component({
  selector: 'app-user-input',
  templateUrl: './user-input.component.html',
  styleUrls: ['./user-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class UserInputComponent implements OnInit {
  constructor(
    public userInputService: UserInputService,
    private notifications: NotificationsService,
    private formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef
  ) {}

  @ViewChild('videoInput')
  videoInput: any;
  @ViewChild('fsFileInput')
  fsFileInput: any;
  video = new BehaviorSubject<File | undefined>(undefined);

  urlForm = this.formBuilder.group({
    url: [{ value: null, disabled: true }, [Validators.minLength(6)]],
  });

  private static getFileExtension(input: string | File): string {
    const element = typeof input === 'string' ? input : input.name;

    return element.substring(element.lastIndexOf('.') + 1);
  }

  private observeFunscriptFile(): void {
    this.userInputService.funscriptFile
      .pipe(untilDestroyed(this))
      .subscribe((val) => {
        if (val) {
          this.urlForm.controls.url.enable();
          this.cdr.markForCheck();
        }
      });
  }

  ngOnInit(): void {
    this.observeFunscriptFile();
  }

  // submit link method
  public submitURL(): void {
    this.userInputService.videoURL.next(this.urlForm.controls.url.value);
  }

  // user upload method

  public onClickFileInputButton(type: 'video' | 'funscript'): void {
    if (type === 'video') {
      this.videoInput.nativeElement.click();
    }

    if (type === 'funscript') {
      this.fsFileInput.nativeElement.click();
    }
  }

  public async onChangeFileInput(type: 'video' | 'funscript'): Promise<void> {
    if (type === 'video') {
      if (this.videoInput.nativeElement.files.length > 0) {
        const files: { [key: string]: File } =
          this.videoInput.nativeElement.files;

        if (!files[0].type.includes('video')) {
          return this.notifications.showToast(`Invalid video file.`, 'error');
        }

        this.video.next(files[0]);
        const videoURL = URL.createObjectURL(files[0]);
        this.userInputService.videoURL.next(videoURL);
        return this.notifications.showToast(
          `Loaded ${files[0].name}`,
          'success'
        );
      } else {
        return this.notifications.showToast(`Failed to load video.`, 'error');
      }
    }

    if (type === 'funscript') {
      if (this.fsFileInput.nativeElement.files.length > 0) {
        const files: { [key: string]: File } =
          this.fsFileInput.nativeElement.files;

        if (UserInputComponent.getFileExtension(files[0]) !== 'funscript') {
          return this.notifications.showToast(
            `Invalid funscript file.`,
            'error'
          );
        }

        return await this.fileToJSON(files[0]).then((r: string) => {
          const funscript: Funscript = r as unknown as Funscript;
          this.userInputService.updateFunscript(funscript, files[0].name);
        });
      } else {
        return this.notifications.showToast(
          `Failed to load funscript file.`,
          'error'
        );
      }
    }
  }

  // load user uploaded funscript file
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
