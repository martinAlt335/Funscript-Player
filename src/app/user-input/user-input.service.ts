import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserInputService {
  videoURL: BehaviorSubject<string> = new BehaviorSubject<string>('');
  funscriptURL: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor() {}
}
