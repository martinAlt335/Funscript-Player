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
    <div class="playback-controller">
      <button
        nz-button
        (click)="togglePlayPause()"
        [nzType]="isPlaying ? 'default' : 'primary'"
        aria-label="Play/Pause Button"
      >
        <i nz-icon [nzType]="isPlaying ? 'pause' : 'caret-right'"></i>
      </button>

      <!-- Slider now works in seconds with smoother updates -->
      <nz-slider
        class="w-10/12"
        [nzMin]="0"
        [(ngModel)]="currentTimeSeconds"
        [nzMax]="maxTimeSeconds"
        [nzStep]="0.1"
        [nzTooltipVisible]="'never'"
        (ngModelChange)="onSeek($event)"
        aria-label="Playback Slider"
      ></nz-slider>

      <span> {{ formatTime(currentTimeMs) }} / {{ formatTime(maxTime) }} </span>
    </div>
  `,
  styles: [
    `
      .playback-controller {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .playback-controller button {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .playback-controller span {
        width: 80px;
        text-align: right;
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
