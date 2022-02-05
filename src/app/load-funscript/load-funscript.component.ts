import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Funscript } from 'funscript-utils/lib/types';
import { UserInputService } from '../load-video/user-input.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationsService } from '../notifications.service';
import { FormBuilder } from '@angular/forms';
import { LoadVideoComponent } from '../load-video/load-video.component';

@UntilDestroy()
@Component({
  selector: 'app-load-funscript',
  templateUrl: './load-funscript.component.html',
  styleUrls: ['./load-funscript.component.scss'],
})
export class LoadFunscriptComponent implements OnInit {
  constructor(
    public userInputService: UserInputService,
    private notifications: NotificationsService,
    private formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef
  ) {}

  @ViewChild('fsFileInput')
  fsFileInput: any;

  private observeFunscriptFile(): void {
    this.userInputService.funscriptFile
      .pipe(untilDestroyed(this))
      .subscribe((val) => {
        if (val) {
          this.userInputService.urlForm.controls.url.enable();
          this.cdr.markForCheck();
        }
      });
  }

  ngOnInit(): void {
    this.observeFunscriptFile();
  }

  public async onFunscriptSelected(): Promise<void> {
    if (this.fsFileInput.nativeElement.files.length > 0) {
      const files: { [key: string]: File } =
        this.fsFileInput.nativeElement.files;

      if (LoadVideoComponent.getFileExtension(files[0]) !== 'funscript') {
        return this.notifications.showToast(`Invalid funscript file.`, 'error');
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

  public onClickFunscriptInputButton(): void {
    this.fsFileInput.nativeElement.click();
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
