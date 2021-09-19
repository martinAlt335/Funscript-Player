import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {NotificationsService} from '../notifications.service';

@Injectable({
  providedIn: 'root',
})
export class UserInputService {
  videoURL: BehaviorSubject<string> = new BehaviorSubject<string>('');
  funscriptURL = new BehaviorSubject<{ name: string, file: string }>({name: '', file: ''});

  constructor(private notifications: NotificationsService) {
  }


  updateFunscript(file: string, name: string): void {
    let fileName;
    if (name !== undefined) {

      if (!name.includes('.funscript')) {
        name = name + '.funscript';
      }

      fileName = name;
    } else { fileName = 'funscript file'; }

    this.funscriptURL.next({name: fileName, file});
    this.notifications.showToast(`Loaded ${fileName}`, 'success');
  }
}
