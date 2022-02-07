import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UserInputService } from '../load-video/user-input.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Funscript } from 'funscript-utils/lib/types';
import { ButtplugService } from '../buttplug/buttplug.service';
import { NzSliderValue } from 'ng-zorro-antd/slider';
import { BehaviorSubject } from 'rxjs';
import { msToTime } from '../utils/ms-to-time';

@UntilDestroy()
@Component({
  selector: 'app-funscript-controller',
  templateUrl: './funscript-controller.component.html',
  styleUrls: ['./funscript-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FunscriptControllerComponent implements OnInit {
  msToTime = msToTime;
  formatter = (value: number) => this.msToTime(value);
  currPos = 0;
  pause: BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
  fsFile: Funscript = { actions: [] };
  interval: NodeJS.Timeout | undefined = undefined;

  constructor(
    private buttPlug: ButtplugService,
    public userInputService: UserInputService
  ) {}

  ngOnInit(): void {
    this.userInputService.funscriptFile
      .pipe(untilDestroyed(this))
      .subscribe(async (val) => {
        if (val.file.actions.length > 0) {
          this.fsFile = val.file;
          // console.log(val.file);
        }
      });

    this.pause.subscribe((paused) => {
      // console.log(paused);
      if (!paused) {
        this.handlePlay();
      }
    });
  }

  handlePlay(): void {
    if (this.interval === undefined) {
      this.interval = setInterval(async () => {
        if (
          !this.pause.value &&
          this.fsFile.actions[this.fsFile.actions.length - 1].at > this.currPos
        ) {
          this.currPos += 100;
          // console.log(this.currPos);
          await this.buttPlug.sendEvent(this.currPos, this.fsFile);
        } else {
          clearInterval(this.interval as NodeJS.Timeout);
          this.interval = undefined;
        }
      }, 100);
      () => this.interval;
    }
  }

  handlePause(forcePause?: boolean): void {
    if (!forcePause) {
      this.pause.next(!this.pause.value);
    } else {
      this.pause.next(true);
    }
  }

  handleControl(event: NzSliderValue): void {
    this.currPos = event as number;
  }
}
