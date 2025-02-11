import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlaybackStateService {
  private mediaUrlSubject = new BehaviorSubject<string | undefined>(undefined);
  public mediaUrl$ = this.mediaUrlSubject.asObservable();

  setMediaUrl(url: string) {
    this.mediaUrlSubject.next(url);
  }
}
