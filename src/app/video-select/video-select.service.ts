import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class VideoSelectService {
  videoURL: BehaviorSubject<string> = new BehaviorSubject<string>('');
  funscriptURL: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor() {}
}
