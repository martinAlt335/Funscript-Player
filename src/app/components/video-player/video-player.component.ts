import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ButtplugService } from '../../core/services/buttplug/buttplug.service';
import { UserInputService } from '../load/load-video/user-input.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Player } from '@vime/angular';
import { ButtplugClientDevice } from 'buttplug';
import { BehaviorSubject } from 'rxjs';
import { NotificationsService } from '../../notifications.service';
import { delay } from '../../utils/delay';
import { Funscript } from 'funscript-utils/lib/types';
import { EventSyncerService } from '../../core/services/event-syncer/event-syncer.service';

@UntilDestroy()
@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPlayerComponent implements OnInit {
  public reload = false;

  @ViewChild('player') player!: Player;

  playerStatus = new BehaviorSubject<{
    error: boolean;
    source: 'standard' | 'hls' | null;
  }>({ error: false, source: null });

  private device: false | ButtplugClientDevice = false;

  funscript!: Funscript;

  constructor(
    public eventSyncerService: EventSyncerService,
    public userInputService: UserInputService,
    public sanitizer: DomSanitizer,
    private buttPlug: ButtplugService,
    private notifications: NotificationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buttPlug.isConnected.subscribe((isConnected) => {
      if (isConnected) {
        this.buttPlug.client.on('deviceadded', async () => {
          this.notifications.showToast('Client connected', 'success');
          this.device = this.buttPlug.client.Devices[0];
        });

        this.buttPlug.client.on('deviceremoved', async () => {
          this.device = false;
        });
      }
    });

    this.getFSChange();
    this.getVidChange();
  }

  logError(error: 'standard' | 'hls', event: Event): void {
    switch (error) {
      case 'standard':
        this.notifications.showToast(
          'Video failed to load. Trying HLS...',
          'info'
        );
        break;
      case 'hls':
        this.notifications.showToast(
          'HLS stream failed. Try another video.',
          'error'
        );
        this.playerStatus.next({ error: true, source: 'hls' });
        break;
    }
  }

  // Subscribe to video URL, on change, trigger detection reloading video player w/ new source.
  private getVidChange(): void {
    this.userInputService.videoURL
      .pipe(untilDestroyed(this))
      .subscribe((val) => {
        if (val) {
          this.playerStatus.next({ error: false, source: 'standard' });
          this.reloadPlayer();
        }
      });
  }

  private reloadPlayer(): void {
    this.reload = true;
    this.cdr.markForCheck();
    delay(1000).then(() => {
      this.reload = false;
      this.cdr.markForCheck();
    });
  }

  private getFSChange(): void {
    this.userInputService.funscriptFile
      .pipe(untilDestroyed(this))
      .subscribe((val) => {
        if (val) {
          this.funscript = val.file as unknown as Funscript;
        }
      });
  }
}
