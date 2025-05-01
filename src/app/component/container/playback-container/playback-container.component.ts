import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { HotkeysDirective, HotkeysService as NgHotkeysService, HotkeysShortcutPipe } from '@ngneat/hotkeys';

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
    HotkeysDirective,
    HotkeysShortcutPipe,
  ],
  templateUrl: './playback-container.component.html',
  styleUrls: ['./playback-container.component.scss'],
})
export class PlaybackContainerComponent implements OnInit, OnDestroy {
  @ViewChild(FunscriptPlaybackControllerComponent) playbackController?: FunscriptPlaybackControllerComponent;
  @ViewChild(VideoPlayerComponent) videoPlayer?: VideoPlayerComponent;

  funscriptDuration: number = 0;
  modifiableFunscript: Funscript | undefined; // Only changes on user upload
  videoUrl: string | undefined;
  mimeType: string = 'video/mp4';

  private subscriptions = new Subscription();

  constructor(
    public configRepo: ConfigRepository,
    public funscriptService: FunscriptActionService,
    private buttplugService: ButtplugService,
    private hotkeysService: NgHotkeysService,
    private playbackState: PlaybackStateService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.funscriptService.duration$.subscribe((duration) => {
        this.funscriptDuration = duration;
      })
    );

    this.subscriptions.add(
      this.funscriptService.funscript$.subscribe(({ funscript, source }) => {
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

    this.registerPlaybackHotkey(); // Register playback toggle hotkey

    this.subscriptions.add(
        this.configRepo.hotkeys$.subscribe(() => {
          this.registerPlaybackHotkey(); // Re-register hotkey when config changes
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    // Remove the hotkey onDestroy
    const key = this.configRepo.hotkeys.togglePlayback;
    this.hotkeysService.removeShortcuts([key]);
  }

  private registerPlaybackHotkey(): void {
    const key = this.configRepo.hotkeys.togglePlayback;

    // Remove existing shortcut
    this.hotkeysService.removeShortcuts([key]);

    this.hotkeysService.addShortcut({
      keys: key,
      description: 'Toggle playback (play/pause)',
      group: 'Playback',
      allowIn: [] // keep empty so as we don't want to allow in input fields
    }).subscribe(() => {
      this.togglePlayback();
    });
  }

  togglePlayback(): void {
    if (this.videoUrl && this.videoPlayer) {
      // If we have video player, toggle its play/pause state
      this.videoPlayer.togglePlayPause();
    } else if (this.playbackController) {
      // Otherwise toggle playback controller
      this.playbackController.togglePlayPause();
    }
  }

  handleUserModifiedFunscript(funscript: Funscript): void {
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
