import {Injectable} from '@angular/core';
import {HotToastService} from '@ngneat/hot-toast';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  constructor(private toastService: HotToastService) {}

  showToast(text: string, type: 'error' | 'info' | 'success'): void {
    if (type === 'error') {
      this.toastService.error(text);
    }

    if (type === 'info') {
      this.toastService.loading(text, {duration: 3000});
    }

    if (type === 'success') {
      this.toastService.success(text);
    }
  }
}
