import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserInputService } from '../../load/load-video/user-input.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { msToTime } from '../../../utils/ms-to-time';
import { EventSyncerService } from '../../../core/services/event-syncer/event-syncer.service';
import { Hotkeys } from '../../../core/services/hotkeys/hotkeys.service';

@UntilDestroy()
@Component({
  selector: 'app-funscript-controller',
  templateUrl: './funscript-controller.component.html',
  styleUrls: ['./funscript-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FunscriptControllerComponent {
  msToTime = msToTime;
  formatter = (value: number) => this.msToTime(value);

  constructor(
    public eventSyncerService: EventSyncerService,
    public userInputService: UserInputService,
    private hotkeys: Hotkeys
  ) {
    hotkeys
      .addShortcut({
        keys: 'space',
        description: 'Pause / Play funscript controller',
      })
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.eventSyncerService.stopWatch.control$.getValue() === 'STOP'
          ? this.eventSyncerService.onPausedChange(false)
          : this.eventSyncerService.onPausedChange(true);
      });
  }
}
