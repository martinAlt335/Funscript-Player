import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotkeysShortcutPipe } from '@ngneat/hotkeys';

@Component({
    selector: 'app-hotkey-indicator',
    standalone: true,
    imports: [CommonModule, HotkeysShortcutPipe],
    template: `
    <div class="hotkey-indicator text-xs text-gray-400">
      <span class="whitespace-nowrap">
        <ng-content></ng-content>
        <kbd class="px-1 bg-zinc-700 rounded ml-1" [innerHTML]="hotkey | hotkeysShortcut"></kbd>
      </span>
    </div>
  `,
    styles: [`
    .hotkey-indicator {
      transition: opacity 0.3s ease;
    }
  `]
})
export class HotkeyIndicatorComponent {
    @Input() hotkey: string = '';
}
