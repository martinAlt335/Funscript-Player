import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtplugConnectionState, ButtplugDeviceInfo, ButtplugService, } from "../service/buttplug.service";
import { FormsModule } from "@angular/forms";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzSwitchModule } from "ng-zorro-antd/switch";
import { NzListModule } from "ng-zorro-antd/list";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { ConfigRepository, ConnectionType, } from "../state/config/config.repository";
import { DevicePreferencesService } from "../service/device-preferences.service";
import { NzTagComponent } from "ng-zorro-antd/tag";
import { NzToolTipComponent } from "ng-zorro-antd/tooltip";
import { NzTypographyComponent } from "ng-zorro-antd/typography";
import { NzCheckboxComponent } from "ng-zorro-antd/checkbox";
import { NzCardComponent } from "ng-zorro-antd/card";
import { NzRadioComponent, NzRadioGroupComponent } from "ng-zorro-antd/radio";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzInputNumberComponent } from "ng-zorro-antd/input-number";
import { NzAlertComponent } from "ng-zorro-antd/alert";
import { NzSliderModule } from "ng-zorro-antd/slider";
import { NzTabComponent, NzTabDirective, NzTabSetComponent, } from "ng-zorro-antd/tabs";
import { DiagnosticService } from "ngx-roast-me";
import { NzModalComponent, NzModalContentDirective } from "ng-zorro-antd/modal";
import { SettingsPanelComponent } from "./settings-panel/settings-panel.component";

@Component({
  selector: "app-buttplug-control-panel",
  standalone: true,
  styleUrl: "./app-buttplug-control-panel.component.scss",
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzSwitchModule,
    NzListModule,
    NzSpinModule,
    NzTagComponent,
    NzToolTipComponent,
    NzTypographyComponent,
    NzCheckboxComponent,
    NzCardComponent,
    NzRadioComponent,
    NzIconDirective,
    NzRadioGroupComponent,
    NzDropDownModule,
    NzInputNumberComponent,
    NzAlertComponent,
    NzSliderModule,
    NzTabComponent,
    NzTabDirective,
    NzTabSetComponent,
    SettingsPanelComponent,
    NzModalComponent,
    NzModalContentDirective,
  ],
  template: `
    @let sendActionsEnabled = configRepo.sendActionsEnabled$ | async; @let
    selectedConnectionType = configRepo.selectedConnectionType$ | async; @let
    scriptTimingOffsetMs = (configRepo.scriptTimingOffsetMs$ | async)!; @let
    externalUrl = (configRepo.externalUrl$ | async)!; @let strokeRange =
    (configRepo.strokeRange$ | async)!; @let deviceResponseDelay =
    (configRepo.deviceResponseDelayMs$ | async)!;

    <!-- SERVER CONTROL -->
    <h2 class="text-lg">Server Control</h2>
    <nz-card class="connection-card">
      <form>
        <!-- Connection Type Radio Buttons -->
        <nz-radio-group
          [ngModel]="selectedConnectionType"
          (ngModelChange)="onConnectionTypeChange($event)"
          name="connectionType"
          aria-label="Connection Type"
        >
          <label nz-radio nzValue="external">
            External Server
            <nz-tooltip
              title="Connect to an external Buttplug server using a WebSocket URL."
            >
              <i
                nz-icon
                nzType="info-circle"
                nzTheme="outline"
                aria-label="External Server Information"
              ></i>
            </nz-tooltip>
          </label>
          <label nz-radio nzValue="local">
            Local Server
            <nz-tooltip
              title="Start a local in-browser Buttplug server without connecting to an external server."
            >
              <i
                nz-icon
                nzType="info-circle"
                nzTheme="outline"
                aria-label="Local Server Information"
              ></i>
            </nz-tooltip>
          </label>
        </nz-radio-group>

        <!-- Warning if local server is chosen but no WebBluetooth -->
        <div
          *ngIf="selectedConnectionType === 'local' && !hasWebBluetooth"
          class="mt-3"
        >
          <nz-alert
            nzType="warning"
            nzMessage="Web Bluetooth is not available in this browser or device, so the local server won't function properly."
            nzShowIcon
          ></nz-alert>
        </div>

        <!-- External Server Input -->
        <div
          *ngIf="selectedConnectionType === 'external'"
          class="external-server-input"
        >
          <nz-input-group nzPrefixIcon="link">
            <input
              nz-input
              placeholder="Enter External Server URL (e.g., ws://localhost:12345)"
              [ngModel]="externalUrl"
              (ngModelChange)="onExternalUrlChange($event)"
              name="externalUrl"
              [ngClass]="{ 'input-error': urlInvalid }"
              aria-label="External Server URL"
            />
          </nz-input-group>
          <div *ngIf="urlInvalid" class="error-message">
            Please enter a valid WebSocket URL.
          </div>
        </div>

        <!-- Connection Buttons -->
        <div class="connection-buttons">
          <button
            nz-button
            nzType="primary"
            (click)="connect()"
            [disabled]="!canConnect || isConnecting"
            aria-label="Connect Button"
          >
            <span
              nz-icon
              nzType="loading"
              nzTheme="outline"
              *ngIf="isConnecting"
            ></span>
            {{
              configRepo.selectedConnectionType === "local" && !hasWebBluetooth
                ? "Requires WebBluetooth"
                : "Connect"
            }}
          </button>
          <button
            class="lg:ml-2"
            nz-button
            nzType="default"
            (click)="disconnect()"
            [disabled]="!isConnected"
            aria-label="Disconnect Button"
          >
            Disconnect
          </button>
        </div>
      </form>

      <!-- Connection Status -->
      <div class="connection-status">
        <span>
          Connection Status:
          <span [ngClass]="connectionStateClass">{{ connectionState }}</span>
        </span>
        <p *ngIf="isConnected">
          Connected to: <strong>{{ connectedUrl }}</strong>
        </p>
      </div>
    </nz-card>

    <!-- ADVANCED SETTINGS IN TABS -->
    <nz-card class="my-4 advanced-settings-card md:hidden">
      <button
          nz-button
          nzType="primary"
          (click)="openSettingsModal()"
          class="w-full"
      >
        <div class="">
          <span class="mr-2" nz-icon nzType="setting"></span>
          <span>Settings</span>
        </div>
      </button>
    </nz-card>

    <!-- Desktop Card -->
    <nz-card class="my-4 advanced-settings-card hidden md:block">
      <h3 class="mb-2">Settings</h3>
      <app-settings-panel
          [scriptTimingOffsetMs]="(configRepo.scriptTimingOffsetMs$ | async)!"
          [deviceResponseDelay]="(configRepo.deviceResponseDelayMs$ | async)!"
          [strokeRange]="(configRepo.strokeRange$ | async)!"
      ></app-settings-panel>
    </nz-card>

    <!-- Settings Modal for Mobile -->
    <nz-modal
        [(nzVisible)]="isSettingsModalVisible"
        nzTitle="Settings"
        (nzOnCancel)="closeSettingsModal()"
        [nzFooter]="null"
        [nzWidth]="'90%'"
    >
      <ng-container *nzModalContent>
      <app-settings-panel
          [scriptTimingOffsetMs]="(configRepo.scriptTimingOffsetMs$ | async)!"
          [deviceResponseDelay]="(configRepo.deviceResponseDelayMs$ | async)!"
          [strokeRange]="(configRepo.strokeRange$ | async)!"
      ></app-settings-panel>
      </ng-container>
    </nz-modal>

    <!-- SCANNING CONTROLS -->
    <nz-card class="scanning-card">
      <h3>Device Scanning</h3>
      <div class="scanning-buttons">
        <button
          nz-button
          nzType="primary"
          (click)="startScanning()"
          [disabled]="!isConnected || isScanning"
          aria-label="Start Scanning Button"
        >
          Start Scanning
        </button>
        <button
          nz-button
          nzType="default"
          (click)="stopScanning()"
          [disabled]="!isConnected || !isScanning"
          aria-label="Stop Scanning Button"
        >
          Stop Scanning
        </button>
      </div>
      <span>
        Scanning:
        <nz-spin *ngIf="isScanning" aria-label="Scanning Indicator"></nz-spin>
        <strong>{{ isScanning ? "In Progress..." : "Stopped" }}</strong>
      </span>
    </nz-card>

    <!-- EMERGENCY STOP -->
    <div
        class="emergency-stop-section cursor-pointer flex flex-col md:flex-row items-start md:items-center"
        [class.green-mode]="sendActionsEnabled"
        [class.red-mode]="!sendActionsEnabled"
        (click)="onSendActionsToggle(!sendActionsEnabled)"
        aria-label="Emergency Stop Section"
    >
      <label class="emergency-label mb-2 md:mb-0">
    <span *ngIf="sendActionsEnabled" class="text-green-500 font-bold">
      Devices Enabled
    </span>
        <span *ngIf="!sendActionsEnabled" class="text-red-500 font-bold">
      Devices Disabled
    </span>
        <nz-switch
            [ngModel]="sendActionsEnabled"
            nzDisabled
            class="emergency-switch ml-2"
            aria-label="Toggle Devices Enabled"
        ></nz-switch>
      </label>
      <div class="emergency-info md:ml-4">
        <p class="info-text text-xs md:text-sm">
      <span *ngIf="sendActionsEnabled">
        Click to
        <span class="font-bold text-red-500">stop all devices</span>
        immediately.
      </span>
          <span *ngIf="!sendActionsEnabled">
        <span class="font-bold">All devices</span> stopped. Click to
        <span class="font-bold">re-enable</span>.
      </span>
        </p>
      </div>
    </div>

    <!-- DEVICES LIST -->
    <nz-card class="devices-card">
      <h3>Connected Devices</h3>
      <nz-list nzBordered="true" *ngIf="devices.length; else noDevices">
        <nz-list-item *ngFor="let device of devices">
          <div class="flex items-center gap-2">
            <b>{{ device.name }}</b>
          </div>

          <!-- Responsive and Scrollable Tags -->
          <div class="overflow-auto flex space-x-2 mt-2">
            <nz-tag [nzColor]="'cyan'" *ngIf="device.canRotate">Rotate</nz-tag>
            <nz-tag [nzColor]="'green'" *ngIf="device.canLinear">Linear</nz-tag>
            <nz-tag [nzColor]="'pink'" *ngIf="device.canVibrate"
              >Vibrate</nz-tag
            >
          </div>

          <div class="mt-2 flex items-center gap-2">
            <!-- Dropdown for Allow Options -->
            <button
              nz-button
              nz-dropdown
              [nzDropdownMenu]="allowMenu"
              [nzClickHide]="false"
            >
              Allow Commands
              <span nz-icon nzType="down"></span>
            </button>
            <nz-dropdown-menu #allowMenu="nzDropdownMenu">
              <ul nz-menu>
                <li nz-menu-item *ngIf="device.canRotate">
                  <label
                    nz-checkbox
                    [(ngModel)]="devicePrefs[device.index].useRotate"
                    (ngModelChange)="updateDevicePreferences(device)"
                  >
                    Allow Rotate Commands
                  </label>
                </li>
                <li nz-menu-item *ngIf="device.canLinear">
                  <label
                    nz-checkbox
                    [(ngModel)]="devicePrefs[device.index].useLinear"
                    (ngModelChange)="updateDevicePreferences(device)"
                  >
                    Allow Linear Commands
                  </label>
                </li>
                <li nz-menu-item *ngIf="device.canVibrate">
                  <label
                    nz-checkbox
                    [(ngModel)]="devicePrefs[device.index].useVibrate"
                    (ngModelChange)="updateDevicePreferences(device)"
                  >
                    Allow Vibrate Commands
                  </label>
                </li>
              </ul>
            </nz-dropdown-menu>
          </div>

          <div class="flex gap-2 mt-2">
            <button
              nz-button
              nz-dropdown
              [nzDropdownMenu]="menu"
              [nzClickHide]="false"
            >
              Test Device
              <span nz-icon nzType="down"></span>
            </button>
            <nz-dropdown-menu #menu="nzDropdownMenu">
              <ul nz-menu>
                <li
                  nz-menu-item
                  *ngIf="device.canVibrate"
                  (click)="vibrateTest(device)"
                >
                  Test Vibrate
                </li>
                <li
                  nz-menu-item
                  *ngIf="device.canRotate"
                  (click)="rotateTest(device)"
                >
                  Test Rotate
                </li>
                <li
                  nz-menu-item
                  *ngIf="device.canLinear"
                  (click)="linearTest(device)"
                >
                  Test Linear
                </li>
              </ul>
            </nz-dropdown-menu>

            <label
              class="!ml-4 !my-auto"
              nz-checkbox
              [(ngModel)]="devicePrefs[device.index].enabled"
              (ngModelChange)="updateDevicePreferences(device)"
              >Enable Device</label
            >
          </div>
        </nz-list-item>
      </nz-list>
      <ng-template #noDevices>
        <span>No Devices Connected</span>
      </ng-template>
    </nz-card>
  `,
})
export class ButtplugControlPanelComponent implements OnInit {
  connectionState = ButtplugConnectionState.DISCONNECTED;
  isConnecting = false;
  isScanning = false;
  devices: ButtplugDeviceInfo[] = [];
  connectedUrl: string | undefined;
  isSettingsModalVisible = false;

  devicePrefs: Record<
    number,
    {
      enabled: boolean;
      useVibrate: boolean;
      useRotate: boolean;
      useLinear: boolean;
    }
  > = {};

  urlInvalid: boolean = false;

  constructor(
    public configRepo: ConfigRepository,
    private buttplugService: ButtplugService,
    private devicePreferencesService: DevicePreferencesService,
    private diagnosticService: DiagnosticService,
  ) {}

  ngOnInit(): void {
    // Subscribe to connection state changes
    this.buttplugService.connectionState$.subscribe((state) => {
      this.connectionState = state;
      if (state === ButtplugConnectionState.CONNECTED) {
        this.connectedUrl = this.buttplugService.getCurrentConnectionUrl();
        this.isConnecting = false;
      } else if (state === ButtplugConnectionState.CONNECTING) {
        this.isConnecting = true;
      } else {
        this.connectedUrl = undefined;
        this.isConnecting = false;
      }
    });

    // Subscribe to scanning state changes
    this.buttplugService.scanning$.subscribe((scanning) => {
      this.isScanning = scanning;
    });

    // Subscribe to device changes
    this.buttplugService.devices$.subscribe((devices) => {
      this.devices = devices;
      // Initialize preferences for any new devices
      for (const d of devices) {
        if (!this.devicePrefs[d.index]) {
          this.devicePrefs[d.index] = {
            enabled: true,
            useVibrate: d.canVibrate,
            useRotate: d.canRotate,
            useLinear: d.canLinear,
          };
        }
      }
      // Update the global preferences store whenever devices or preferences change
      this.updateGlobalPreferences();
    });

    // Initial load of global preferences
    this.updateGlobalPreferences();
  }

  get hasWebBluetooth(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof window.navigator !== "undefined" &&
      (navigator as any).bluetooth !== undefined
    );
  }

  get isConnected(): boolean {
    return this.connectionState === ButtplugConnectionState.CONNECTED;
  }

  // Compute whether the Connect button should be enabled
  get canConnect(): boolean {
    if (this.configRepo.selectedConnectionType === "external") {
      return this.configRepo.externalUrl.trim().length > 0 && !this.urlInvalid;
    }
    if (this.configRepo.selectedConnectionType === "local") {
      return this.hasWebBluetooth;
    }
    return true;
  }

  // CSS classes for connection state
  get connectionStateClass(): string {
    switch (this.connectionState) {
      case ButtplugConnectionState.CONNECTED:
        return "connected";
      case ButtplugConnectionState.CONNECTING:
        return "connecting";
      case ButtplugConnectionState.DISCONNECTED:
      default:
        return "disconnected";
    }
  }

  openSettingsModal(): void {
    this.isSettingsModalVisible = true;
  }

  closeSettingsModal(): void {
    this.isSettingsModalVisible = false;
  }

  connect(): void {
    if (this.configRepo.selectedConnectionType === "external") {
      if (!this.validateUrl(this.configRepo.externalUrl)) {
        this.urlInvalid = true;
        setTimeout(() => (this.urlInvalid = false), 2000);
        return;
      }
      this.urlInvalid = false;
      this.buttplugService
        .connectToExternalServer(this.configRepo.externalUrl)
        .catch((err) => {
          this.diagnosticService.logError("Failed to connect to external server:", err);
        });
    } else if (this.configRepo.selectedConnectionType === "local") {
      this.buttplugService.connectToLocalServer().catch((err) => {
        this.diagnosticService.logError("Failed to connect to local server:", err);
      });
    }
  }

  disconnect(): void {
    this.buttplugService.disconnect().catch((err) => {
      this.diagnosticService.logError("Failed to disconnect:", err);
    });
  }

  startScanning(): void {
    this.buttplugService.startScanning().catch((err) => {
      this.diagnosticService.logError("Failed to start scanning:", err);
    });
  }

  stopScanning(): void {
    this.buttplugService
      .stopScanning()
      .catch((err) => {
        this.diagnosticService.logError("Failed to stop scanning:", err);
      })
      .then(() => (this.isScanning = false));
  }

  vibrateTest(device: ButtplugDeviceInfo): void {
    this.buttplugService
      .vibrateDevice(device.index, 0.2)
      .then(() => {
        setTimeout(() => this.buttplugService.stopDevice(device.index), 1000);
      })
      .catch((err) => {
        this.diagnosticService.logError("Vibrate test failed:", err);
      });
  }

  rotateTest(device: ButtplugDeviceInfo): void {
    this.buttplugService
      .rotateDevice(device.index, 0.5, true)
      .then(() =>
        setTimeout(() => this.buttplugService.stopDevice(device.index), 1000)
      )
      .catch((err) => this.diagnosticService.logError("Rotate test failed:", err));
  }

  linearTest(device: ButtplugDeviceInfo): void {
    this.buttplugService
      .linearDevice(device.index, 0.8, 1000)
      .then(() =>
        setTimeout(() => this.buttplugService.stopDevice(device.index), 1000)
      )
      .catch((err) => this.diagnosticService.logError("Linear test failed:", err));
  }

  onSendActionsToggle(isEnabled: boolean): void {
    this.configRepo.updateState({ sendActionsEnabled: isEnabled });

    const devicesCount = this.buttplugService.getDevices().length;

    if (!isEnabled && devicesCount > 0) {
      this.buttplugService.stopAllDevices().catch((err) => {
        this.diagnosticService.logError("Failed to stop all devices:", err);
      });
    }
  }

  // Method to handle connection type changes
  onConnectionTypeChange(newType: ConnectionType): void {
    this.configRepo.updateState({ selectedConnectionType: newType });
  }

  // Method to handle external URL changes
  onExternalUrlChange(newUrl: string): void {
    this.configRepo.updateState({ externalUrl: newUrl });
  }

  onTimingOffsetChange(newOffset: number) {
    this.configRepo.updateState({ scriptTimingOffsetMs: newOffset });
  }

  onStrokeRangeChange(newVal: number) {
    this.configRepo.updateState({ strokeRange: newVal });
  }

  onDeviceResponseDelayChange(newVal: number) {
    this.configRepo.updateState({ deviceResponseDelayMs: newVal });
  }

  updateDevicePreferences(device: ButtplugDeviceInfo): void {
    const prefs = this.devicePrefs[device.index];
    if (prefs) {
      this.devicePreferencesService.setPreference(device.index, {
        enabled: prefs.enabled,
        useVibrate: prefs.useVibrate,
        useRotate: prefs.useRotate,
        useLinear: prefs.useLinear,
      });
    }

    if (!prefs.enabled) {
      this.buttplugService.stopDevice(device.index).catch((err) => {
        this.diagnosticService.logError(`Failed to stop device ${device.name}:`, err);
      });
    }
  }

  updateGlobalPreferences(): void {
    for (const dev of this.devices) {
      const prefs = this.devicePrefs[dev.index];
      if (prefs) {
        this.devicePreferencesService.setPreference(dev.index, {
          enabled: prefs.enabled,
          useVibrate: prefs.useVibrate,
          useRotate: prefs.useRotate,
          useLinear: prefs.useLinear,
        });
      }
    }
  }

  validateUrl(url: string): boolean {
    const pattern = /^wss?:\/\/[\w.-]+(:\d+)?(\/[\w.-]*)*$/;
    return pattern.test(url);
  }

  // Formatter to display input as plain number without commas or decimals
  formatter = (value: number): string => `${value}`;

  // Parser to ensure input is parsed correctly
  parser = (value: string): string => value;
}
