import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ButtplugService } from '../buttplug.service';
import { VideoSelectService } from '../video-select/video-select.service';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Player } from '@vime/angular';
import {ButtplugClient, ButtplugClientDevice, ButtplugDeviceMessageType} from 'buttplug';

@UntilDestroy()
@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class VideoPlayerComponent implements OnInit {
  private device: false | ButtplugClientDevice = false;
  public reload = false;
  @ViewChild('player') player!: Player;

  constructor(
    public buttPlug: ButtplugService,
    public videoService: VideoSelectService,
    public sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buttPlug.isConnected.subscribe(isConnected => {
      if (isConnected) {
        this.buttPlug.client.on('deviceadded', async () => {
          this.device = this.buttPlug.client.Devices[0];
          this.canLinear(this.buttPlug.client.Devices[0]);
          await this.buttPlug.client.Devices[0].linear(60 * 0.01, 3.5 * 1000);
          this.delay(6000).then(async () => {
              await this.buttPlug.client.Devices[0].linear(20 * 0.01, 3.5 * 1000);
          });
        });
      }
    });

    // Subscribe to video URL, on change, trigger detection reloading video player w/ new source.
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

  async onTimeUpdate(event: CustomEvent<number>): Promise<void> {

  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private canLinear(device: ButtplugClientDevice): boolean {
    console.log(device.messageAttributes(ButtplugDeviceMessageType.LinearCmd));
    return device.messageAttributes(ButtplugDeviceMessageType.LinearCmd) !== undefined;
  }
}
