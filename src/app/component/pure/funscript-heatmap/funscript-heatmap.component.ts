import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Funscript } from 'funscript-utils/lib/types';
import { renderHeatmap as funUtilsRenderHeatmap } from 'funscript-utils/lib/funMapper';
import { getHalfSpeedScript } from 'funscript-utils/lib/funHalver';
import { getLimitedScript, getOffsetScript, getRemappedScript } from 'funscript-utils/lib/funTweaker';

interface HalfSpeedOptions {
  removeShortPauses: boolean;
  shortPauseDuration: number;
  matchFirstDownstroke: boolean;
  matchGroupEndPosition: boolean;
  resetAfterPause: boolean;
}

@Component({
  selector: 'app-funscript-heatmap',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './funscript-heatmap.component.html',
  styleUrl: './funscript-heatmap.component.scss',
})
export class FunscriptHeatmapComponent implements OnChanges {
  @Input() funscript!: Funscript;
  @ViewChild('heatmap', { static: true }) heatmap!: ElementRef;
  @Output() modifiedFunscript = new EventEmitter<Funscript>();

  canvasWidthPx: number = 800;
  canvasHeightPx: number = 80;

  modifiableFunscript: Funscript | null = null;
  modifiedMetrics = {
    duration: 0,
    actionCount: 0,
    averageSpeed: 0
  };

  // UI state
  showControls: boolean = false;
  activeTab: 'speed' | 'position' | 'offset' = 'speed';

  // Modification options
  halfSpeedOptions: HalfSpeedOptions = {
    removeShortPauses: true,
    shortPauseDuration: 2000,
    matchFirstDownstroke: false,
    matchGroupEndPosition: true,
    resetAfterPause: false,
  };

  positionRange = { min: 0, max: 100 };
  speedLimit: 'launch' | 'handy' | number = 'handy';
  timeOffset: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['funscript']?.currentValue) {
      this.resetToOriginal();
    }
  }

  resetToOriginal(): void {
    this.modifiableFunscript = JSON.parse(JSON.stringify(this.funscript));
    this.calculateMetrics();
    this.renderHeatmap();
    this.modifiedFunscript.emit(this.modifiableFunscript!);
  }

  applyHalfSpeed(): void {
    if (!this.modifiableFunscript) return;

    this.modifiableFunscript = getHalfSpeedScript(
        this.modifiableFunscript,
        this.halfSpeedOptions
    );

    this.calculateMetrics();
    this.renderHeatmap();
    this.modifiedFunscript.emit(this.modifiableFunscript);
  }

  applyRemapPositions(): void {
    if (!this.modifiableFunscript) return;

    this.modifiableFunscript = getRemappedScript(
        this.modifiableFunscript,
        this.positionRange.min,
        this.positionRange.max
    );

    this.calculateMetrics();
    this.renderHeatmap();
    this.modifiedFunscript.emit(this.modifiableFunscript);
  }

  applySpeedLimit(): void {
    if (!this.modifiableFunscript) return;

    this.modifiableFunscript = getLimitedScript(
        this.modifiableFunscript,
        this.speedLimit
    );

    this.calculateMetrics();
    this.renderHeatmap();
    this.modifiedFunscript.emit(this.modifiableFunscript);
  }

  applyTimeOffset(): void {
    if (!this.modifiableFunscript) return;

    this.modifiableFunscript = getOffsetScript(
        this.modifiableFunscript,
        this.timeOffset
    );

    this.calculateMetrics();
    this.renderHeatmap();
    this.modifiedFunscript.emit(this.modifiableFunscript);
  }

  toggleControls(): void {
    this.showControls = !this.showControls;
  }

  setActiveTab(tab: 'speed' | 'position' | 'offset'): void {
    this.activeTab = tab;
  }

  private calculateMetrics(): void {
    if (this.modifiableFunscript) {
      const modifiedActions = this.modifiableFunscript.actions;
      this.modifiedMetrics = {
        duration: modifiedActions.length > 0 ? modifiedActions[modifiedActions.length - 1].at : 0,
        actionCount: modifiedActions.length,
        averageSpeed: this.modifiableFunscript.metadata?.average_speed || 0
      };
    }
  }

  private renderHeatmap(): void {
    // Render heatmap to reflect script changes
    if (this.modifiableFunscript && this.heatmap?.nativeElement) {
      const canvas = this.heatmap.nativeElement;
      const ctx = canvas.getContext('2d');

      // Set inner canvas rendering dimensions
      canvas.width = this.canvasWidthPx;
      canvas.height = this.canvasHeightPx;

      // Clear canvas before rendering
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      funUtilsRenderHeatmap(
          canvas,
          this.modifiableFunscript,
          {
            background: 'rgba(0, 0, 0, 0.1)',
            showStrokeLength: true
          }
      );
    }
  }

  formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
