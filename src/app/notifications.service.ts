import { Injectable } from '@angular/core';
import {HotToastService} from '@ngneat/hot-toast';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private toastService: HotToastService) {}

  showToast(text: string, type: 'error' | 'success'): void {
    if (type === 'error') {
      this.toastService.error(text);
    }

    if (type === 'success') {
      this.toastService.success(text);
    }
  }
}
