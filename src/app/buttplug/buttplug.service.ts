import { Injectable } from '@angular/core';
import {
  ButtplugClient,
  ButtplugClientDevice,
  ButtplugEmbeddedConnectorOptions,
  ButtplugWebsocketConnectorOptions,
} from 'buttplug';
import { BehaviorSubject } from 'rxjs';
import { NotificationsService } from '../notifications.service';
import { delay } from '../utils/delay';
import { Funscript } from 'funscript-utils/lib/types';
import { StateService } from '../state.service';

@Injectable({
  providedIn: 'root',
})
export class ButtplugService {
  constructor(
    private state: StateService,
    private notifications: NotificationsService
  ) {
    this.trackClientStatus();
  }

  public device: false | ButtplugClientDevice = false;

  public client!: ButtplugClient;
  public isConnected = new BehaviorSubject<boolean>(false);
  public isScanning = false;
  public isConnecting = false;
  public scanTime = 30000; // 30 second scanning limit

  activeEvent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  savedAction: { at: number; pos: number } = { at: 0, pos: 0 };
  debugNumber = 0;

  get HasWebBluetooth(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.navigator !== 'undefined' &&
      (navigator as any).bluetooth !== undefined
    );
  }

  private static OnDeviceListChanged(aDevice: ButtplugClientDevice): void {
    console.log(aDevice);
  }

  /** Tracks buttPlug service updating active target device variable on device changes. */
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

  private AddListeners(): void {
    this.client.addListener('deviceadded', ButtplugService.OnDeviceListChanged);
    this.client.addListener(
      'deviceremoved',
      ButtplugService.OnDeviceListChanged
    );
    this.client.addListener('scanningfinished', this.OnScanningFinished);
    this.client.addListener('disconnect', this.RemoveListeners);
  }

  private RemoveListeners(): void {
    this.client.removeListener(
      'deviceremoveed',
      ButtplugService.OnDeviceListChanged
    );
    this.client.removeListener(
      'deviceremoved',
      ButtplugService.OnDeviceListChanged
    );
    this.client.removeListener('scanningfinished', this.OnScanningFinished);
    this.client.removeListener('disconnect', this.RemoveListeners);
  }

  public async ConnectInBrowser(): Promise<void> {
    const connector = new ButtplugEmbeddedConnectorOptions();
    await this.Connect(connector);
  }

  public async Connect(
    aConnector:
      | ButtplugEmbeddedConnectorOptions
      | ButtplugWebsocketConnectorOptions
  ): Promise<void> {
    this.client = new ButtplugClient('Funscript Player');
    this.AddListeners();
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
      this.RemoveListeners();
      return Promise.reject('test');
    } finally {
      this.isConnecting = false;
    }
    // If we don't connect successfully, the above try statement will throw. Assume that
    // we're connected if we get this far.
    this.isConnected.next(true);
    await this.StartScanning();
  }

  async Disconnect(): Promise<void> {
    await this.client.disconnect();
    this.RemoveListeners();
    this.notifications.showToast('Client disconnected.', 'error');
    this.isConnected.next(false);
  }

  public async ToggleScanning(): Promise<void> {
    if (this.isScanning) {
      await this.StopScanning();
      return;
    }
    await this.StartScanning();
  }

  private async StartScanning(): Promise<void> {
    await this.client.startScanning();
    setTimeout(async () => await this.StopScanning(), this.scanTime);
    this.isScanning = true;
  }

  private async StopScanning(): Promise<void> {
    // The setTimeout to call this may fire after disconnect. If so, just drop
    // it.

    if (!this.client.Connected) {
      return;
    }

    await this.client.stopScanning();
    this.isScanning = false;
  }

  private OnScanningFinished(): void {
    this.isScanning = false;
  }

  public async sendEvent(
    currTime: number,
    funscript: Funscript
  ): Promise<void> {
    if (this.device) {
      const range = { min: currTime - 50, max: currTime + 50 };
      // get index of action in the bounds of range
      const index = funscript.actions.findIndex(
        (item: { at: number; pos: number }) =>
          item.at >= range.min && item.at <= range.max
      );
      if (
        // if match && not an action that's already run
        index !== -1 &&
        funscript.actions[index].at !== this.savedAction.at
      ) {
        if (funscript.actions[index + 1] !== undefined) {
          // if did not reach end of actions
          this.savedAction = funscript.actions[index];
          const set = {
            current: funscript.actions[index],
            next: funscript.actions[index + 1],
          };

          const duration = set.next.at - set.current.at;

          if (set) {
            if (!this.state.isProd) {
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
            this.activeEvent.next(true);
            await this.device.linear(set.current.pos * 0.01, duration);
            await delay(duration).then(() => {
              this.activeEvent.next(false);
              if (!this.state.isProd) {
                console.log('Action', this.debugNumber, 'done.');
              }
            });
          }
        }
      }
    }

    return delay(25).then(() => {
      this.activeEvent.next(false);
    });
  }
}
