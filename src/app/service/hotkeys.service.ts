import { Injectable, OnDestroy } from '@angular/core';
import { HotkeysService as NgHotkeysService } from '@ngneat/hotkeys';
import { ConfigRepository } from '../state/config/config.repository';
import { ButtplugService } from './buttplug.service';
import { DiagnosticService } from 'ngx-roast-me';
import { Subscription } from 'rxjs';
import { CustomHotkeysHelpComponent } from "../component/container/hotkeys-help-component/custom-hotkeys-help.component";

@Injectable({
    providedIn: 'root'
})
export class HotkeysService implements OnDestroy {
    private subscriptions = new Subscription();

    constructor(
        private hotkeys: NgHotkeysService,
        private configRepo: ConfigRepository,
        private buttplugService: ButtplugService,
        private diagnosticService: DiagnosticService
    ) {}

    /**
     * Initialize hotkeys service and register hotkeys from config
     */
    registerDeviceToggleHotkeyAndChangeListener() {
        this.registerDeviceToggleHotkey();

        this.subscriptions.add(
            this.configRepo.hotkeys$.subscribe(() => {
                this.registerDeviceToggleHotkey();
            })
        );
    }

    /**
     * Register the device toggle hotkey
     */
    private registerDeviceToggleHotkey() {
        const key = this.configRepo.hotkeys.toggleDevices;

        this.hotkeys.removeShortcuts([key]); // Remove existing device toggle shortcut if any

        this.hotkeys.addShortcut({
            keys: key,
            description: 'Toggle devices enabled/disabled',
            group: 'Devices',
            allowIn: ['SELECT', 'TEXTAREA'] // Allow hotkey to work inside inputs
        }).subscribe(() => {
            // When triggered, toggle devices state
            const sendActionsEnabled = this.configRepo.sendActionsEnabled;
            this.configRepo.updateState({ sendActionsEnabled: !sendActionsEnabled });

            if (!sendActionsEnabled && this.buttplugService.getDevices().length > 0) {
                this.buttplugService.stopAllDevices().catch(err => {
                    this.diagnosticService.logError("Failed to stop all devices:", err);
                });
            }
        });
    }

    /**
     * Register help modal for hotkeys
     * @param modalService The modal service to use for displaying the help
     */
    registerHelpModal(modalService: any) {
        this.hotkeys.registerHelpModal(() => {
            const instance = modalService.create({
                nzContent: CustomHotkeysHelpComponent,
                nzFooter: null,
                nzWidth: '800px',
                nzBodyStyle: { padding: '0' },
            });

            const component = instance.getContentComponent();
            if (component) {
                component.dismiss.subscribe(() => instance.close());
            }
        }, 'shift.?'); // Use shift+? as default shortcut to show help
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}

