import { Injectable, Type, ViewContainerRef } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalOptions } from 'ng-zorro-antd/modal/modal-types';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private modal: NzModalService) {}

  createComponentModal<T>(
    component: Type<T>,
    viewContainerRef: ViewContainerRef,
    title?: string,
    config?: ModalOptions
  ): void {
    this.modal.create({
      ...config,
      nzContent: component,
      nzViewContainerRef: viewContainerRef,
      nzTitle: title,
      nzFooter: null,
      nzWidth: 410,
    });
  }
}
