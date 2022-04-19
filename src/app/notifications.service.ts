import { Injectable } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { ToastPosition } from '@ngneat/hot-toast/lib/hot-toast.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  toastConfig = {
    duration: 3000,
    position: 'top-right' as ToastPosition,
    style: {
      border: '1px solid rgb(42 41 41)',
      background: '#171717',
      padding: '16px',
      color: 'white',
    },
    iconTheme: {
      primary: '#177ddc',
      secondary: '#FFFAEE',
    },
  };

  constructor(private toastService: HotToastService) {}

  showToast(
    text: string,
    type: 'error' | 'warning' | 'info' | 'success'
  ): void {
    switch (type) {
      case 'error':
        this.toastService.error(text, { ...this.toastConfig });
        break;
      case 'warning':
        this.toastService.warning(text, { ...this.toastConfig });
        break;
      case 'info':
        this.toastService.loading(text, { ...this.toastConfig });
        break;
      case 'success':
        this.toastService.success(text, { ...this.toastConfig });
        break;
    }
  }
}
