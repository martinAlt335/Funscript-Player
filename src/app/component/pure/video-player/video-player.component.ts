import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';
import { DiagnosticService } from "ngx-roast-me";

export enum MimeTypes {
  HLS = 'application/vnd.apple.mpegurl',
  MP4 = 'video/mp4',
  STREAM = 'application/octet-stream',
}

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
})
export class VideoPlayerComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit
{
  @Input() sourceUrl!: string;
  @Input() mimeType: MimeTypes = MimeTypes.HLS;
  @Output() currentTimeMs = new EventEmitter<number>();
  @Output() paused = new EventEmitter<void>();

  @ViewChild('videoPlayer', { static: true })
  videoRef!: ElementRef<HTMLVideoElement>;

  private rafId?: number;
  private isPlaying = false;
  private hls?: Hls;

  private lastEmitTime = 0;
  private emissionIntervalMs = 20;

  constructor(private diagnosticService: DiagnosticService) {}

  ngOnInit(): void {
    this.initializePlayer();
  }

  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;
    video.addEventListener('play', this.onPlay);
    video.addEventListener('pause', this.onPause);
    video.addEventListener('ended', this.onPause);
  }

  ngOnDestroy() {
    const video = this.videoRef.nativeElement;
    video.removeEventListener('play', this.onPlay);
    video.removeEventListener('pause', this.onPause);
    video.removeEventListener('ended', this.onPause);
    this.destroyHlsPlayer();
    this.stopRafLoop();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sourceUrl'] || changes['mimeType']) {
      this.initializePlayer();
    }
  }

  /**
   * Toggles video playback between play and pause states
   */
  togglePlayPause(): void {
    const video = this.videoRef.nativeElement;
    if (video.paused) {
      video.play().catch(err => {
        this.diagnosticService.logError('Error playing video:', err);
      });
    } else {
      video.pause();
    }
  }

  private onPlay = () => {
    this.isPlaying = true;
    this.startRafLoop();
  };

  private onPause = () => {
    this.isPlaying = false;
    this.stopRafLoop();
    this.paused.emit();
  };

  private startRafLoop() {
    this.stopRafLoop();
    const loop = () => {
      if (!this.isPlaying) return;

      const video = this.videoRef.nativeElement;
      const currentTime = video.currentTime;
      const now = performance.now();

      if (now - this.lastEmitTime >= this.emissionIntervalMs) {
        const currentTimeMs = currentTime * 1000;
        this.currentTimeMs.emit(currentTimeMs);
        this.lastEmitTime = now;
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private stopRafLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }

  // Player Setup Methods

  private initializePlayer(): void {
    const video = this.videoRef.nativeElement;
    this.destroyHlsPlayer();

    if (this.isHlsSupported() && this.isHlsSource()) {
      this.initializeHlsPlayer();
    } else {
      video.src = this.sourceUrl;
      video.load();
    }
  }

  private isHlsSupported(): boolean {
    return Hls.isSupported();
  }

  private isHlsSource(): boolean {
    return this.mimeType === MimeTypes.HLS;
  }

  private initializeHlsPlayer(): void {
    this.hls = new Hls();
    this.hls.loadSource(this.sourceUrl);
    this.hls.attachMedia(this.videoRef.nativeElement);
    this.hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            this.diagnosticService.logError('Fatal network error encountered, try to recover');
            this.hls?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            this.diagnosticService.logError('Fatal media error encountered, try to recover');
            this.hls?.recoverMediaError();
            break;
          default:
            this.hls?.destroy();
            break;
        }
      }
    });
  }

  private destroyHlsPlayer(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = undefined;
    }
    const video = this.videoRef.nativeElement;
    video.src = '';
    video.load();
  }
}
