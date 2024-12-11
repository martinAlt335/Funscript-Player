import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Funscript } from 'funscript-utils/lib/types';
import { HeatmapOptions, renderHeatmap } from 'funscript-utils/lib/funMapper';

@Component({
  selector: 'app-funscript-heatmap',
  standalone: true,
  imports: [],
  templateUrl: './funscript-heatmap.component.html',
  styleUrl: './funscript-heatmap.component.scss',
})
export class FunscriptHeatmapComponent implements OnChanges {
  @Input() funscript!: Funscript;
  @Input() widthPx!: number;
  @Input() heightPx!: number;

  @ViewChild('heatmap', { static: true })
  heatmap!: ElementRef;

  ngOnChanges(changes: SimpleChanges) {
    const funscriptFile = changes?.['funscript']?.currentValue;

    if (funscriptFile) {
      this.generateHeatMap(funscriptFile);
    }
  }

  async generateHeatMap(
    funscript: Funscript,
    options?: HeatmapOptions
  ): Promise<void> {
    await new Promise((resolve, _) => {
      renderHeatmap(this.heatmap.nativeElement, funscript, options ?? {});
      setTimeout(resolve, 1000);
    });
  }
}
