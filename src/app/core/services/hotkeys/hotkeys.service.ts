import { Injectable, Inject } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DOCUMENT } from '@angular/common';

type Options = {
  element: any;
  description: string | undefined;
  keys: string;
};

@Injectable({
  providedIn: 'root',
})
export class Hotkeys {
  hotkeys = new Map();
  defaults: Partial<Options> = {
    element: this.document,
  };

  constructor(
    private eventManager: EventManager,
    private modal: NzModalService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  addShortcut(options: Partial<Options>): Observable<any> {
    const merged = { ...this.defaults, ...options };
    const event = `keydown.${merged.keys}`;

    // tslint:disable-next-line:no-unused-expression
    merged.description && this.hotkeys.set(merged.keys, merged.description);

    return new Observable((observer) => {
      const handler = (e: any) => {
        e.preventDefault();
        observer.next(e);
      };

      const dispose = this.eventManager.addEventListener(
        merged.element,
        event,
        handler
      );

      return () => {
        dispose();
        this.hotkeys.delete(merged.keys);
      };
    });
  }
}
