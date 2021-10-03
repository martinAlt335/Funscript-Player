import {Injectable} from '@angular/core';
import {
  ButtplugClient,
  ButtplugClientDevice,
  ButtplugEmbeddedConnectorOptions,
  ButtplugWebsocketConnectorOptions,
} from 'buttplug';
import {BehaviorSubject} from 'rxjs';
import {NotificationsService} from '../notifications.service';
import {delay} from '../utilts';
import {Funscript} from 'funscript-utils/lib/types';

@Injectable({
  providedIn: 'root',
})
export class ButtplugService {
  constructor(private notifications: NotificationsService) {}

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

  private AddListeners(): void {
    this.client.addListener('deviceadded', ButtplugService.OnDeviceListChanged);
    this.client.addListener('deviceremoved', ButtplugService.OnDeviceListChanged);
    this.client.addListener('scanningfinished', this.OnScanningFinished);
    this.client.addListener('disconnect', this.RemoveListeners);
  }

  private RemoveListeners(): void {
    this.client.removeListener('deviceremoveed', ButtplugService.OnDeviceListChanged);
    this.client.removeListener('deviceremoved', ButtplugService.OnDeviceListChanged);
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
    this.isConnecting = true;
    this.client = new ButtplugClient('Funscript Player');
    this.AddListeners();
    try {
      await this.client.connect(aConnector).catch((e: any) => {
        console.log(e);
        return;
      });
    } catch (e) {
      console.log(e);
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

  public async sendEvent(currTime: number, device: false | ButtplugClientDevice, funscript: Funscript): Promise<void> {
    if (device) {
      const range = { min: currTime - 50, max: currTime + 50 };

      console.log(range);


      // get index of action in the bounds of range
      const index = funscript.actions.findIndex(
        (item: { at: number; pos: number }) =>
          item.at >= range.min && item.at <= range.max
      );

      if ( // if match && not an action that's already run
        index !== -1 &&
        funscript.actions[index].at !== this.savedAction.at
      ) {
        if (funscript.actions[index + 1] !== undefined) { // if did not reach end of actions
          this.savedAction = funscript.actions[index];
          const set = {
            current: funscript.actions[index],
            next: funscript.actions[index + 1],
          };

          const duration = set.next.at - set.current.at;

          if (set) {
            this.activeEvent.next(true);
            this.debugNumber++;
            console.log('Action', this.debugNumber, ': Sent position of', set.current.pos * 0.01, 'with duration of', duration);
            await device.linear(set.current.pos * 0.01, duration);
            await delay(duration).then(() => {
              console.log('Action', this.debugNumber, 'done.');
              this.activeEvent.next(false);
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
