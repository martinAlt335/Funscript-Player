import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FunscriptActionService } from '../../../service/funscript-action.service';
import { PlaybackStateService } from '../../../service/playback-state.service';
import { FunscriptHeatmapComponent } from '../../pure/funscript-heatmap/funscript-heatmap.component';
import { FunscriptPlaybackControllerComponent } from '../../pure/funscript-playback-controller/funscript-playback-controller.component';
import { VideoPlayerComponent } from '../../pure/video-player/video-player.component';
import { Subscription } from 'rxjs';
import { ButtplugService } from '../../../service/buttplug.service';
import { ConfigRepository } from '../../../state/config/config.repository';
import { Funscript } from 'funscript-utils/lib/types';
import { NzSwitchComponent } from 'ng-zorro-antd/switch';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-playback-container',
  standalone: true,
  imports: [
    CommonModule,
    FunscriptHeatmapComponent,
    FunscriptPlaybackControllerComponent,
    VideoPlayerComponent,
    NzSwitchComponent,
    FormsModule,
  ],
  templateUrl: './playback-container.component.html',
  styleUrls: ['./playback-container.component.scss'],
})
export class PlaybackContainerComponent implements OnInit, OnDestroy {
  funscriptDuration: number = 0;
  modifiableFunscript: Funscript | undefined; // Only changes on user upload
  videoUrl: string | undefined;
  mimeType: string = 'video/mp4';

  private subscriptions = new Subscription();

  constructor(
    public funscriptService: FunscriptActionService,
    private playbackState: PlaybackStateService,
    private buttplugService: ButtplugService,
    private configRepo: ConfigRepository
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.funscriptService.duration$.subscribe((duration) => {
        this.funscriptDuration = duration;
      })
    );

    this.subscriptions.add(
      this.funscriptService.funscript$.subscribe(({ funscript, source }) => {
        // We only want 'upload' events to affect the rendered heatmap. 'edit' events won't affect, otherwise we will spiral into a change loop.
        if (source === 'upload') {
          this.modifiableFunscript = funscript;
        }
      })
    );

    this.subscriptions.add(
      this.playbackState.mediaUrl$.subscribe((url) => {
        this.videoUrl = url;
        this.mimeType = this.getMimeTypeFromUrl(url);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleUserModifiedFunscript(funscript: Funscript) {
    // Load the edited funscript file and set source as 'edit' so we don't spiral into an update-loop from our above subscription.
    // In our subscription above, we only change modify the locally stored file if it was an 'upload' event.
    this.funscriptService.loadFunscript(funscript, 'edit');
  }

  handlePlaybackTimeUpdate(timeMs: number): void {
    this.funscriptService.checkTime(timeMs);
  }

  handlePlaybackPause(): void {
    if (this.configRepo.sendActionsEnabled) {
      this.buttplugService.stopAllDevices().then();
    }
    this.funscriptService.reset();
  }

  private getMimeTypeFromUrl(url?: string): string {
    if (!url) return 'video/mp4';
    if (url.endsWith('.m3u8')) {
      return 'application/vnd.apple.mpegurl';
    } else if (url.endsWith('.mp4')) {
      return 'video/mp4';
    }
    return 'application/octet-stream';
  }
}
