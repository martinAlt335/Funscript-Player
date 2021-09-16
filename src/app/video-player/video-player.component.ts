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
import {BehaviorSubject} from 'rxjs';

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
  private device: false | ButtplugClientDevice = false;
  coolDown: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  funscript: any;

  constructor(
    private buttPlug: ButtplugService,
    public videoService: UserInputService,
    public sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buttPlug.isConnected.subscribe((isConnected) => {
      if (isConnected) {
        this.buttPlug.client.on('deviceadded', async () => {
          this.device = this.buttPlug.client.Devices[0];
          this.canLinear(this.device);
          await this.device.linear(60 * 0.01, 3.5 * 1000);
        });
      }
    });

    // this.buttPlug.isConnected.subscribe(isConnected => {
    //   console.log(isConnected);
    //   if (isConnected) {
    //     this.buttPlug.client.on('deviceadded', () => {
    //       console.log(this.buttPlug.client.Devices[0]);
    //       // this.device = this.buttPlug.client.Devices[0];
    //     });
    //   }
    //
    //   if (!isConnected) {
    //     this.buttPlug.client.on('deviceremoved', async () => {
    //       this.device = false;
    //     });
    //   }
    // });

    this.getFSChange();
    this.getVidChange();
  }

  onTimeUpdate(event: CustomEvent<number>): void {
    if (this.coolDown.value) {
      return;
    }

    if (!this.coolDown.value) {
      this.coolDown.next(true);
      this.sendEvent(Math.round(event.detail * 1000)).then(() => {
        return;
      });
    }
  }

  async sendEvent(currTime: number): Promise<void> {
    if (this.device) {
      console.log(currTime);
      const range = {min: currTime - 500, max: currTime + 500};
      const found = this.funscript.actions.find((item: { at: number, pos: number }) => (item.at >= range.min && item.at <= range.max));
      console.log(found);

      if (found) {
        await this.device.linear(found.pos * 0.01, 1000);
      }

      await this.delay(500).then(() => {
        this.coolDown.next(false);
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private canLinear(device: ButtplugClientDevice): boolean {
    console.log(device.messageAttributes(ButtplugDeviceMessageType.LinearCmd));
    return (
      device.messageAttributes(ButtplugDeviceMessageType.LinearCmd) !==
      undefined
    );
  }

  // Subscribe to video URL, on change, trigger detection reloading video player w/ new source.
  private getVidChange(): void {
    this.videoService.videoURL.pipe(untilDestroyed(this)).subscribe((val) => {
      if (val) {
        console.log(val);
        this.reload = true;
        this.cdr.markForCheck();
        this.delay(1000).then(() => {
          this.reload = false;
          this.cdr.markForCheck();
        });
      }
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
