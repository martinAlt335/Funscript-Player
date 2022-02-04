import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  public colorScheme: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private colorSchemePrefix = 'color-scheme-';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  _detectPrefersColorScheme(): void {
    if (window.matchMedia('(prefers-color-scheme)').media !== 'not all') {
      this.colorScheme.next(
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      );
    } else {
      this.colorScheme.next('dark');
    }
  }

  _setColorScheme(scheme: string): void {
    this.colorScheme.next(scheme);
    localStorage.setItem('prefers-color', scheme);
  }

  _getColorScheme(): void {
    const localStorageColorScheme = localStorage.getItem('prefers-color');
    if (localStorageColorScheme) {
      this.colorScheme.next(localStorageColorScheme);
    } else {
      this._detectPrefersColorScheme();
    }
  }

  load(): void {
    this._getColorScheme();
    this.renderer.addClass(
      document.body,
      this.colorSchemePrefix + this.colorScheme.value
    );
  }

  update(scheme: 'dark' | 'light'): void {
    this._setColorScheme(scheme);
    this.renderer.removeClass(
      document.body,
      this.colorSchemePrefix +
        (this.colorScheme.value === 'dark' ? 'light' : 'dark')
    );
    this.renderer.addClass(document.body, this.colorSchemePrefix + scheme);
  }

  switch(): void {
    if (this.currentActive() === 'dark') {
      this.update('light');
    } else {
      this.update('dark');
    }
  }

  currentActive(): string {
    return this.colorScheme.value;
  }
}
