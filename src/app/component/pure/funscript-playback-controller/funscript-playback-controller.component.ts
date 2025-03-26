import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-funscript-playback-controller',
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    CommonModule,
    NzSliderModule,
    NzButtonModule,
    NzIconModule,
    FormsModule,
  ],
  template: `
    <div class="playback-controller w-full h-full flex flex-col">
      <div class="flex justify-between items-center w-full mb-2">
        <button
            nz-button
            (click)="togglePlayPause()"
            [nzType]="isPlaying ? 'default' : 'primary'"
            aria-label="Play/Pause Button"
        >
          <i nz-icon [nzType]="isPlaying ? 'pause' : 'caret-right'"></i>
        </button>

        <span class="time-display text-xs md:text-sm">
      {{ formatTime(currentTimeMs) }} / {{ formatTime(maxTime) }}
    </span>
      </div>

      <nz-slider
          class="w-full enhanced-slider"
          [nzMin]="0"
          [(ngModel)]="currentTimeSeconds"
          [nzMax]="maxTimeSeconds"
          [nzStep]="0.1"
          [nzTooltipVisible]="'never'"
          (ngModelChange)="onSeek($event)"
          aria-label="Playback Slider"
      ></nz-slider>
    </div>
  `,
  styles: [
    `
      .playback-controller {
        width: 100%;
      }

      .play-button {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .time-display {
        font-weight: 500;
        color: #d9d9d9;
      }

      /* Slider styling */
      ::ng-deep .enhanced-slider {
        .ant-slider-rail {
          background-color: rgba(255, 255, 255, 0.15) !important;
          height: 6px !important;
        }

        .ant-slider-track {
          background-color: #1890ff !important;
          height: 6px !important;
        }

        .ant-slider-handle {
          width: 16px !important;
          height: 16px !important;
          border: 2px solid #1890ff !important;
          background-color: white !important;
          margin-top: -5px !important;
          box-shadow: 0 0 5px rgba(24, 144, 255, 0.6) !important;
        }

        .ant-slider-handle:focus {
          box-shadow: 0 0 8px rgba(24, 144, 255, 0.8) !important;
        }
      }
    `,
  ],
})
export class FunscriptPlaybackControllerComponent implements OnInit, OnDestroy {
  @Output() play = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() seek = new EventEmitter<number>();
  @Output() currentTimeMsOutput = new EventEmitter<number>();

  /**
   * maxTime is provided in milliseconds by the parent
   */
  @Input() maxTime: number = 60000;
  @Input() initialTime: number = 0; // in ms

  constructor(private cdr: ChangeDetectorRef) {}

  isPlaying = false;

  // Track time in milliseconds
  currentTimeMs: number = 0;
  currentTimeSeconds: number = 0;
  maxTimeSeconds: number = 60;

  private intervalId?: number;

  ngOnInit(): void {
    this.maxTimeSeconds = this.maxTime / 1000;
    this.currentTimeMs = this.initialTime;
    this.currentTimeSeconds = this.currentTimeMs / 1000;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['maxTime']) {
      this.maxTimeSeconds = this.maxTime / 1000;
    }
    if (changes && changes['initialTime']) {
      this.currentTimeMs = this.initialTime;
      this.currentTimeSeconds = this.currentTimeMs / 1000;
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause.emit();
      this.isPlaying = false;
      this.stopTimer();
    } else {
      this.play.emit();
      this.isPlaying = true;
      this.startTimer();
    }
  }

  startTimer() {
    const interval = 20; // 20 ms for smoother updates
    this.intervalId = window.setInterval(() => {
      this.currentTimeMs += interval;

      if (this.currentTimeMs >= this.maxTime) {
        this.currentTimeMs = this.maxTime;
        this.currentTimeSeconds = this.currentTimeMs / 1000;
        this.currentTimeMsOutput.emit(this.currentTimeMs);
        this.togglePlayPause();
        return;
      }

      this.currentTimeSeconds = this.currentTimeMs / 1000;
      this.currentTimeMsOutput.emit(this.currentTimeMs);

      // Trigger change detection if necessary
      this.cdr.markForCheck();
    }, interval);
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * When the user seeks, value is in seconds. Convert back to ms.
   */
  onSeek(value: number) {
    this.stopTimer(); // Stop current playback
    this.currentTimeSeconds = value;
    this.currentTimeMs = value * 1000;

    // Emit the seek event
    this.seek.emit(this.currentTimeMs);
    this.currentTimeMsOutput.emit(this.currentTimeMs);

    // If it was playing, resume playback
    if (this.isPlaying) {
      this.startTimer();
    }
  }

  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  reset() {
    this.stopTimer();
    this.currentTimeMs = 0;
    this.currentTimeSeconds = 0;
    this.currentTimeMsOutput.emit(0);
  }
}
