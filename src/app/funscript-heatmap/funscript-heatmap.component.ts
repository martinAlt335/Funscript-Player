import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild
} from '@angular/core';
import {Funscript} from 'funscript-utils/lib/types';
import {HeatmapOptions, renderHeatmap} from 'funscript-utils/lib/funMapper';
import {UserInputService} from '../user-input/user-input.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ButtplugService} from '../buttplug/buttplug.service';
import {ButtplugClientDevice} from 'buttplug';
import {NotificationsService} from '../notifications.service';

@UntilDestroy()
@Component({
  selector: 'app-funscript-heatmap',
  templateUrl: './funscript-heatmap.component.html',
  styleUrls: ['./funscript-heatmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FunscriptHeatmapComponent implements AfterViewInit {
  public reload = false;

  @Input() funscript!: Funscript;
  @Input() width!: number;
  @Input() height!: number;

  value = 0;
  step = 100;

  private device: false | ButtplugClientDevice = false;

  @ViewChild('heatmap', {static: false})
  heatmap!: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private buttPlug: ButtplugService,
    private userInputService: UserInputService,
    private notifications: NotificationsService) {
  }

  ngAfterViewInit(): void {
    this.buttPlug.isConnected.subscribe((isConnected) => {
      if (isConnected) {
        this.buttPlug.client.on('deviceadded', async () => {
          this.device = this.buttPlug.client.Devices[0];
        });

        this.buttPlug.client.on('deviceremoved', async () => {
          this.device = false;
        });
      }
    });

    this.userInputService.funscriptFile.pipe(untilDestroyed(this)).subscribe(async (val) => {
      if (val) {
        await this.generateHeatMap(this.funscript, this.width, this.height);
        this.cdr.markForCheck();
      }
    });
  }

  async startFunscript(): Promise<void> {
    if (this.device) {
      while (this.funscript.actions[this.funscript.actions.length - 1].at > this.value) {
        // await new Promise((resolve) => setTimeout(resolve, 50)).then(async () => {
          console.log('moved');
          this.value += this.step;
          if (!this.buttPlug.activeEvent.value) {
            await this.buttPlug.sendEvent(Math.round(this.value), this.device, this.funscript).then();
          }
        // });
      }
    } else {
      this.notifications.showToast('No client connected.', 'error');
    }
  }

  async generateHeatMap(
    funscript: Funscript,
    width: number,
    height: number,
    options?: HeatmapOptions
  ): Promise<void> {

    await new Promise((resolve, reject) => {
      if (options) {
        renderHeatmap(this.heatmap.nativeElement, funscript, options);
        setTimeout(resolve, 1000);
      } else {
        renderHeatmap(this.heatmap.nativeElement, funscript);
        setTimeout(resolve, 1000);
      }
    });
  }
}
