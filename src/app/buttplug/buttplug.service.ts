import { Injectable } from '@angular/core';
import {
  ButtplugClient,
  ButtplugClientDevice,
  ButtplugEmbeddedConnectorOptions,
  ButtplugWebsocketConnectorOptions,
} from 'buttplug';
import { BehaviorSubject } from 'rxjs';
import {NotificationsService} from '../notifications.service';

enum UiMessageType {
  Error,
  Status,
}

@Injectable({
  providedIn: 'root',
})
export class ButtplugService {

  constructor(private notifications: NotificationsService) {
  }

  public client!: ButtplugClient;
  public isConnected = new BehaviorSubject<boolean>(false);
  public isScanning = false;
  public isConnecting = false;
  // 30 second scanning limit
  public scanTime = 30000;
  // Blank array when disconnected. Mirrors ButtplugClient device array
  // otherwise. Takes some extra logic to get vue to keep up with it.
  public cookies: any = (window as any).$cookies;
  public bp!: any;

  public get HasWebBluetooth(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.navigator !== 'undefined' &&
      (navigator as any).bluetooth !== undefined
    );
  }

  private OnDeviceListChanged(aDevice: ButtplugClientDevice): void {
    // Just reset our internal device array.
    console.log(aDevice);
  }

  public async ConnectInBrowser(): Promise<void> {
    const connector = new ButtplugEmbeddedConnectorOptions();
    await this.Connect(connector);
  }

  private AddListeners(): void {
    this.client.addListener('deviceadded', this.OnDeviceListChanged);
    this.client.addListener('deviceremoved', this.OnDeviceListChanged);
    this.client.addListener('scanningfinished', this.OnScanningFinished);
    this.client.addListener('disconnect', this.RemoveListeners);
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
    this.isConnected.next(true);
    // If we don't connect successfully, the above line will throw. Assume that
    // we're connected if we get this far.
    await this.StartScanning();
  }

  private RemoveListeners(): void {
    this.client.removeListener('deviceremoveed', this.OnDeviceListChanged);
    this.client.removeListener('deviceremoved', this.OnDeviceListChanged);
    this.client.removeListener('scanningfinished', this.OnScanningFinished);
    this.client.removeListener('disconnect', this.RemoveListeners);
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

  public async ToggleScanning(): Promise<void> {
    if (this.isScanning) {
      await this.StopScanning();
      return;
    }
    await this.StartScanning();
  }

  async Disconnect(): Promise<void> {
    await this.client.disconnect();
    this.RemoveListeners();
    this.notifications.showToast('Client disconnected.', 'error');
    this.isConnected.next(false);
  }
}
