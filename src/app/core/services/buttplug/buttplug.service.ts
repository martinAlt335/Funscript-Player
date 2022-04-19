import { Injectable } from '@angular/core';
import {
  ButtplugClient,
  ButtplugClientDevice,
  ButtplugEmbeddedConnectorOptions,
  ButtplugWebsocketConnectorOptions,
} from 'buttplug';
import { BehaviorSubject } from 'rxjs';
import { NotificationsService } from '../../../notifications.service';
import { Action } from 'funscript-utils/lib/types';
import { ConfigRepository } from '../../../../state/config/config.repository';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ButtplugService {
  device: false | ButtplugClientDevice = false;

  client!: ButtplugClient;
  isConnected = new BehaviorSubject<boolean>(false);
  isScanning = false;
  isConnecting = false;
  scanTime = 30000; // 30 second scanning limit
  // activeEvent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  isLocked = false;
  savedAction: { at: number; pos: number } = { at: 0, pos: 0 };
  debugNumber = 0;

  constructor(
    private configR: ConfigRepository,
    private notifications: NotificationsService
  ) {
    this.trackClientStatus();
  }

  get hasWebBluetooth(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.navigator !== 'undefined' &&
      (navigator as any).bluetooth !== undefined
    );
  }

  private static onDeviceListChanged(aDevice: ButtplugClientDevice): void {
    console.log(aDevice);
  }

  async connectInBrowser(): Promise<void> {
    const connector = new ButtplugEmbeddedConnectorOptions();
    await this.connect(connector);
  }

  /** @dev tracks buttPlug service updating class variable `device` on device change(s). */
  private trackClientStatus(): void {
    this.isConnected.subscribe((isConnected) => {
      if (isConnected) {
        this.client.on('deviceadded', async () => {
          this.notifications.showToast('Client connected', 'success');
          this.device = this.client.Devices[0];
        });

        this.client.on('deviceremoved', async () => {
          this.device = false;
        });
      }
    });
  }

  private async connect(
    aConnector:
      | ButtplugEmbeddedConnectorOptions
      | ButtplugWebsocketConnectorOptions
  ): Promise<void> {
    this.client = new ButtplugClient('Funscript Player');
    this.listenersAdd();
    try {
      await this.client
        .connect(aConnector)
        .then(() => (this.isConnecting = true))
        .catch((e: any) => {
          console.log(e);
          return;
        });
    } catch (e) {
      console.log(e);
      this.isConnecting = false;
      this.listenersRemove();
      return Promise.reject(e);
    } finally {
      this.isConnecting = false;
    }
    // If we don't connect successfully, the above try statement will throw. Assume that
    // we're connected if we get this far.
    this.isConnected.next(true);
    await this.startScanning();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
    this.listenersRemove();
    this.notifications.showToast('Client disconnected.', 'error');
    this.isConnected.next(false);
  }

  async sendEvent(
    set: { current: Action; next: Action },
    range: { min: number; max: number },
    duration: number
  ): Promise<void> {
    if (!environment.production) {
      console.log(range);
      this.debugNumber++;
      console.log(
        'Action',
        this.debugNumber,
        ': Sent position of',
        set.current.pos * 0.01,
        'with duration of',
        duration
      );
    }

    if (!this.isLocked) {
      await this.sendCommand(set.current.pos, duration).then((command) => {
        if (!environment.production && command) {
          console.log('Action', this.debugNumber, `of type ${command} done.`);
        }
      });
    }
  }

  private async sendCommand(
    pos: number,
    duration: number
  ): Promise<string | void> {
    if (this.device === false) {
      return void 0;
    }

    this.isLocked = true;

    const command = this.configR.store.getValue().command;

    switch (command) {
      case 'linear':
        await this.device
          .linear(pos * 0.01, duration)
          .catch((e) => this.sendCommandErrHandler(e));
        break;
      case 'vibrate':
        await this.device
          .vibrate(1 - pos * 0.01)
          .catch((e) => this.sendCommandErrHandler(e));
        break;
      case 'linear+rotate':
        this.notifications.showToast('Not implemented yet.', 'warning');
        break;
    }

    this.isLocked = false;

    return command;
  }

  async toggleScanning(): Promise<void> {
    if (this.isScanning) {
      await this.stopScanning();
      return;
    }
    await this.startScanning();
  }

  private listenersAdd(): void {
    this.client.addListener('deviceadded', ButtplugService.onDeviceListChanged);
    this.client.addListener(
      'deviceremoved',
      ButtplugService.onDeviceListChanged
    );
    this.client.addListener('scanningfinished', this.onScanningFinished);
    this.client.addListener('disconnect', this.listenersRemove);
  }

  private listenersRemove(): void {
    this.client.removeListener(
      'deviceremoveed',
      ButtplugService.onDeviceListChanged
    );
    this.client.removeListener(
      'deviceremoved',
      ButtplugService.onDeviceListChanged
    );
    this.client.removeListener('scanningfinished', this.onScanningFinished);
    this.client.removeListener('disconnect', this.listenersRemove);
  }

  private sendCommandErrHandler(e: any): void {
    if (e.toString().includes('does not exist')) {
      this.notifications.showToast(
        `Your device does not support ${
          this.configR.store.getValue().command
        } commands. Open settings to change commands `,
        'error'
      );
    } else {
      this.notifications.showToast(`Device errored. ${e}`, 'error');
    }
  }

  private async startScanning(): Promise<void> {
    await this.client.startScanning();
    setTimeout(async () => await this.stopScanning(), this.scanTime);
    this.isScanning = true;
  }

  private async stopScanning(): Promise<void> {
    // The setTimeout to call this may fire after disconnect. If so, just drop
    // it.
    if (!this.client.Connected) {
      return;
    }

    await this.client.stopScanning();
    this.isScanning = false;
  }

  private onScanningFinished(): void {
    this.isScanning = false;
  }
}
