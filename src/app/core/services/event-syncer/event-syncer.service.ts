import { Injectable } from '@angular/core';
import { Funscript } from 'funscript-utils/lib/types';
import { UserInputService } from '../../../components/load/load-video/user-input.service';
import { ButtplugService } from '../buttplug/buttplug.service';
import { getStopWatch } from '../../../utils/stopwatch';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventSyncerService {
  funscript!: Funscript;

  currMediaTime = 0;
  interval = 50;
  stopWatch = getStopWatch(this.interval);

  savedAction: { at: number; pos: number } = { at: 0, pos: 0 };
  debugNumber = 0;

  constructor(
    private buttPlugService: ButtplugService,
    private userInputService: UserInputService
  ) {
    this.getFSChange();
    this.stopWatch.display$.subscribe(async (emission) => {
      this.currMediaTime = this.currMediaTime + this.interval;
      if (!environment.production) {
        console.log(emission, this.currMediaTime);
      }
      await this.eventManager();
    });
  }

  async eventManager(): Promise<void> {
    const range = {
      min: this.currMediaTime - 50,
      max: this.currMediaTime + 50,
    };
    // get index of action in the bounds of range
    const index = this.funscript.actions.findIndex(
      (item: { at: number; pos: number }) =>
        item.at >= range.min && item.at <= range.max
    );
    if (
      // if match && not an action that's already run
      index !== -1 &&
      this.funscript.actions[index].at !== this.savedAction.at
    ) {
      if (this.funscript.actions[index + 1] !== undefined) {
        // if did not reach end of actions
        this.savedAction = this.funscript.actions[index];

        const set = {
          current: this.funscript.actions[index],
          next: this.funscript.actions[index + 1],
        };

        const duration = set.next.at - set.current.at;
        await this.buttPlugService.sendEvent(set, range, duration);
      }
    }
  }

  onPausedChange(paused: boolean | CustomEvent<boolean>): void {
    switch (paused) {
      case true:
        this.stopWatch.control$.next('STOP');
        break;
      case false:
        this.stopWatch.control$.next('START');
        break;
    }
  }

  onSeekedChange(currTime: number | number[]): void {
    if (!environment.production) {
      console.log('seeked to', currTime);
    }
    if (typeof currTime === 'number') {
      this.currMediaTime = currTime;
    }
  }

  private getFSChange(): void {
    this.userInputService.funscriptFile.subscribe((val) => {
      if (val) {
        this.funscript = val.file as unknown as Funscript;
      }
    });
  }
}
