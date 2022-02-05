import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { Funscript } from 'funscript-utils/lib/types';
import { HeatmapOptions, renderHeatmap } from 'funscript-utils/lib/funMapper';
import { UserInputService } from '../load-video/user-input.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-funscript-heatmap',
  templateUrl: './funscript-heatmap.component.html',
  styleUrls: ['./funscript-heatmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FunscriptHeatmapComponent implements AfterViewInit {
  @Input() funscript!: Funscript;
  @Input() width!: number;
  @Input() height!: number;

  @ViewChild('heatmap', { static: false })
  heatmap!: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private userInputService: UserInputService
  ) {}

  ngAfterViewInit(): void {
    this.userInputService.funscriptFile
      .pipe(untilDestroyed(this))
      .subscribe(async (val) => {
        if (val) {
          await this.generateHeatMap(this.funscript, this.width, this.height);
          this.cdr.markForCheck();
        }
      });
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
