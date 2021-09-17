import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ButtplugService } from '../buttplug/buttplug.service';
import { UserInputService } from '../user-input/user-input.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Player } from '@vime/angular';
import { ButtplugClientDevice, ButtplugDeviceMessageType } from 'buttplug';
import { BehaviorSubject } from 'rxjs';
import { NotificationsService } from '../notifications.service';

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

  funscript: any;
  activeEvent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  savedAction: { at: number; pos: number } = { at: 0, pos: 0 };
  debugNumber = 0;

  constructor(
    private buttPlug: ButtplugService,
    public videoService: UserInputService,
    private notifications: NotificationsService,
    public sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buttPlug.isConnected.subscribe((isConnected) => {
      if (isConnected) {
        this.buttPlug.client.on('deviceadded', async () => {
          this.notifications.showToast('Client connected', 'success');
          this.device = this.buttPlug.client.Devices[0];
          this.canLinear(this.device);
          await this.device.linear(60 * 0.01, 3.5 * 1000);
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
    console.log(event);
    if (error === 'standard') {
      this.notifications.showToast('Video failed to load. Trying HLS.', 'info');
      this.playerStatus.next({error: true, source: 'standard'});
    } else {
      this.notifications.showToast('HLS stream failed. Try another video.', 'error');
      this.playerStatus.next({error: true, source: 'hls'}); }
  }

  onTimeUpdate(event: CustomEvent<number>): void {
    if (this.activeEvent.value) {
      return;
    }

    if (!this.activeEvent.value) {
      this.sendEvent(Math.round(event.detail * 1000)).then(() => {
        return;
      });
    }
  }

  async sendEvent(currTime: number): Promise<void> {
    if (this.device) {
      const range = { min: currTime - 50, max: currTime + 50 };

      // get index of action in the bounds of range
      const index = this.funscript.actions.findIndex(
        (item: { at: number; pos: number }) =>
          item.at >= range.min && item.at <= range.max
      );

      if ( // if match && not an action that's already run
        index !== -1 &&
        this.funscript.actions[index].at !== this.savedAction.at
      ) {
        if (this.funscript.actions[index + 1] !== undefined) { // if did not reach end of actions
          this.savedAction = this.funscript.actions[index];
          const set = {
            current: this.funscript.actions[index],
            next: this.funscript.actions[index + 1],
          };

          const duration = set.next.at - set.current.at;

          if (set) {
            this.activeEvent.next(true);
            this.debugNumber++;
            console.log('Action', this.debugNumber, ': Sent position of', set.current.pos * 0.01, 'with duration of', duration);
            await this.device.linear(set.current.pos * 0.01, duration);
            await this.delay(duration).then(() => {
              console.log('Action', this.debugNumber, 'done.');
              this.activeEvent.next(false);
            });
          }
        }
      }
    }

    return this.delay(25).then(() => {
      this.activeEvent.next(false);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private canLinear(device: ButtplugClientDevice): boolean {
    return (
      device.messageAttributes(ButtplugDeviceMessageType.LinearCmd) !==
      undefined
    );
  }

  // Subscribe to video URL, on change, trigger detection reloading video player w/ new source.
  private getVidChange(): void {
    this.videoService.videoURL.pipe(untilDestroyed(this)).subscribe((val) => {
      if (val) {
        this.playerStatus.next({error: false, source: 'standard'});
        this.reloadPlayer();
      }
    });
  }

  private reloadPlayer(): void {
    this.reload = true;
    this.cdr.markForCheck();
    this.delay(1000).then(() => {
      this.reload = false;
      this.cdr.markForCheck();
    });
  }

  private getFSChange(): void {
    this.videoService.funscriptURL
      .pipe(untilDestroyed(this))
      .subscribe((val) => {
        if (val) {
          this.funscript = val;
        }
      });
  }
}
