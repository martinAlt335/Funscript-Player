import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotkeysShortcutPipe } from '@ngneat/hotkeys';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ConfigRepository } from "../../../state/config/config.repository";

@Component({
    selector: 'app-custom-hotkeys-help',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NzButtonModule,
        NzModalModule,
        NzInputModule,
        NzIconModule,
        NzDividerModule,
        HotkeysShortcutPipe
    ],
    template: `
    <div class="hotkeys-container p-4">
      <h2 class="text-xl font-bold mb-4">{{ title }}</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="hotkey-section">
          <h3 class="text-lg font-bold mb-2">Playback Controls</h3>
          <div class="hotkey-item flex justify-between items-center p-2 border-b border-zinc-700">
            <span>Toggle Playback (Play/Pause)</span>
            <div class="flex items-center">
              <kbd class="px-2 py-1 bg-zinc-800 rounded mr-2" [innerHTML]="playbackHotkey | hotkeysShortcut"></kbd>
              <button 
                nz-button 
                nzSize="small" 
                (click)="showEditModal('togglePlayback')"
                class="text-xs"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
        
        <div class="hotkey-section">
          <h3 class="text-lg font-bold mb-2">Device Controls</h3>
          <div class="hotkey-item flex justify-between items-center p-2 border-b border-zinc-700">
            <span>Toggle Devices Enabled/Disabled</span>
            <div class="flex items-center">
              <kbd class="px-2 py-1 bg-zinc-800 rounded mr-2" [innerHTML]="deviceHotkey | hotkeysShortcut"></kbd>
              <button 
                nz-button 
                nzSize="small" 
                (click)="showEditModal('toggleDevices')"
                class="text-xs"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-4">
        <nz-divider></nz-divider>
        <p class="text-sm text-gray-400">
          Press <kbd class="px-1 bg-zinc-800 rounded"  [innerHTML]="'shift.?' | hotkeysShortcut"></kbd> to open this dialog at any time.
        </p>
      </div>
      
      <div class="flex justify-end mt-4">
        <button nz-button nzType="primary" (click)="onDismiss()">Close</button>
      </div>
    </div>
    
    <!-- Edit Hotkey Modal -->
    <nz-modal
      [(nzVisible)]="isEditModalVisible"
      [nzTitle]="'Edit ' + (editingHotkey === 'togglePlayback' ? 'Playback' : 'Devices') + ' Hotkey'"
      (nzOnCancel)="cancelEdit()"
      (nzOnOk)="saveHotkey()"
    >
      <ng-container *nzModalContent>
        <p class="mb-4">Press the key or key combination you want to use for this shortcut:</p>
        <div class="flex items-center">
          <span class="mr-2">Current:</span>
          <kbd class="px-2 py-1 bg-zinc-800 rounded" [innerHTML]="newHotkey | hotkeysShortcut"></kbd>
        </div>
        <div class="mt-4">
          <input 
            nz-input 
            #hotkeyInput
            [value]="'Click here and press keys'"
            (keydown)="recordHotkey($event)"
            (click)="$any($event).target?.select()"
            class="w-full"
          />
        </div>
        <p class="mt-2 text-xs text-gray-400">
          Examples: "space" for spacebar, "shift.d" for Shift+D, "meta.s" for Command+S on Mac or Ctrl+S on Windows
        </p>
      </ng-container>
    </nz-modal>
  `,
    styles: [`
    .hotkeys-container {
      max-height: 80vh;
      overflow-y: auto;
    }
    
    kbd {
      font-family: monospace;
      display: inline-block;
    }
  `]
})
export class CustomHotkeysHelpComponent implements OnInit {
    @Input() title = 'Keyboard Shortcuts';
    @Output() dismiss = new EventEmitter<void>();

    playbackHotkey = 'space';
    deviceHotkey = 'shift.d';

    isEditModalVisible = false;
    editingHotkey: 'togglePlayback' | 'toggleDevices' | null = null;
    newHotkey = '';

    constructor(
        private configRepo: ConfigRepository
    ) {}

    ngOnInit(): void {
        const hotkeys = this.configRepo.hotkeys;
        this.playbackHotkey = hotkeys.togglePlayback;
        this.deviceHotkey = hotkeys.toggleDevices;
    }

    onDismiss(): void {
        this.dismiss.emit();
    }

    showEditModal(type: 'togglePlayback' | 'toggleDevices'): void {
        this.editingHotkey = type;
        this.newHotkey = type === 'togglePlayback' ? this.playbackHotkey : this.deviceHotkey;
        this.isEditModalVisible = true;
    }

    cancelEdit(): void {
        this.isEditModalVisible = false;
        this.editingHotkey = null;
    }

    saveHotkey(): void {
        if (!this.editingHotkey || !this.newHotkey) {
            this.isEditModalVisible = false;
            return;
        }

        // Update the hotkey in the config
        this.configRepo.updateHotkey(this.editingHotkey, this.newHotkey);

        // Update local state
        if (this.editingHotkey === 'togglePlayback') {
            this.playbackHotkey = this.newHotkey;
        } else {
            this.deviceHotkey = this.newHotkey;
        }

        this.isEditModalVisible = false;
        this.editingHotkey = null;
    }

    recordHotkey(event: KeyboardEvent): void {
        // Prevent default to avoid typing in input
        event.preventDefault();

        // Record key combination
        const key = event.key.toLowerCase();

        // Handle special keys and combinations
        let hotkey = '';

        if (event.ctrlKey) hotkey += 'ctrl.';
        if (event.shiftKey) hotkey += 'shift.';
        if (event.altKey) hotkey += 'alt.';
        if (event.metaKey) hotkey += 'meta.';

        // Add main key
        if (key !== 'control' && key !== 'shift' && key !== 'alt' && key !== 'meta') {
            if (key === ' ') {
                hotkey += 'space';
            } else if (key === 'escape') {
                hotkey += 'esc';
            } else if (key === 'arrowup') {
                hotkey += 'up';
            } else if (key === 'arrowdown') {
                hotkey += 'down';
            } else if (key === 'arrowleft') {
                hotkey += 'left';
            } else if (key === 'arrowright') {
                hotkey += 'right';
            } else {
                hotkey += key;
            }
        }

        // Only update if we have a valid hotkey
        if (hotkey && !hotkey.endsWith('.')) {
            this.newHotkey = hotkey;
        }
    }
}
