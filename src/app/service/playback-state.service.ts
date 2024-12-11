import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlaybackStateService {
  private videoUrlSubject = new BehaviorSubject<string | undefined>(undefined);
  public videoUrl$ = this.videoUrlSubject.asObservable();

  setVideoUrl(url: string) {
    this.videoUrlSubject.next(url);
  }
}
