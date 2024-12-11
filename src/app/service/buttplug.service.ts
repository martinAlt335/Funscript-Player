import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ButtplugBrowserWebsocketClientConnector,
  ButtplugClient,
  ButtplugClientDevice,
  ButtplugDeviceError,
  ButtplugError,
} from 'buttplug';
import { ButtplugWasmClientConnector } from 'buttplug-wasm/dist/buttplug-wasm.mjs';
import { NzMessageService } from 'ng-zorro-antd/message';

export interface ButtplugDeviceInfo {
  index: number;
  name: string;
  canVibrate: boolean;
  canLinear: boolean;
  canRotate: boolean;
}

// Enum to represent current connection state
export enum ButtplugConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
}

export const CLIENT_NAME = 'FunPlayer';

@Injectable({
  providedIn: 'root',
})
export class ButtplugService {
  private client?: ButtplugClient;

  private connectionStateSubject = new BehaviorSubject<ButtplugConnectionState>(
    ButtplugConnectionState.DISCONNECTED
  );
  private scanningSubject = new BehaviorSubject<boolean>(false);
  private devicesSubject = new BehaviorSubject<ButtplugDeviceInfo[]>([]);

  // Observables for components to subscribe to
  public readonly connectionState$: Observable<ButtplugConnectionState> =
    this.connectionStateSubject.asObservable();
  public readonly scanning$: Observable<boolean> =
    this.scanningSubject.asObservable();
  public readonly devices$: Observable<ButtplugDeviceInfo[]> =
    this.devicesSubject.asObservable();

  constructor(private message: NzMessageService) {}

  public getCurrentConnectionUrl(): string | undefined {
    // If using external connector, store the URL when connecting:
    return this._currentUrl;
  }

  private _currentUrl?: string;

  // Additionally, add a method to get devices array directly:
  public getDevices(): ButtplugDeviceInfo[] {
    return this.devicesSubject.value;
  }

  /**
   * Connects to an external Buttplug server via WebSockets.
   * e.g. ws://localhost:12345 or wss://myserver.com/buttplug
   */
  public async connectToExternalServer(url: string): Promise<void> {
    this.disconnect(); // Ensure clean slate
    this._currentUrl = url;
    this.connectionStateSubject.next(ButtplugConnectionState.CONNECTING);

    this.client = new ButtplugClient(CLIENT_NAME);
    this.setupClientListeners();

    const connector = new ButtplugBrowserWebsocketClientConnector(url);
    try {
      await this.client.connect(connector);
      this.connectionStateSubject.next(ButtplugConnectionState.CONNECTED);
    } catch (e) {
      console.error('Failed to connect to external server:', e);
      this.connectionStateSubject.next(ButtplugConnectionState.DISCONNECTED);
      throw e;
    }
  }

  /**
   * Connects to an in-browser WASM Buttplug server.
   * This will allow the application to act as a server itself.
   */
  public async connectToLocalServer(): Promise<void> {
    this.disconnect(); // Ensure clean slate
    this._currentUrl = 'In-Browser Server';
    this.connectionStateSubject.next(ButtplugConnectionState.CONNECTING);

    this.client = new ButtplugClient(CLIENT_NAME);
    this.setupClientListeners();

    try {
      const connector = new ButtplugWasmClientConnector();
      await this.client.connect(connector);
      this.connectionStateSubject.next(ButtplugConnectionState.CONNECTED);
    } catch (e) {
      console.error('Failed to connect to local WASM server:', e);
      this.connectionStateSubject.next(ButtplugConnectionState.DISCONNECTED);
      throw e;
    }
  }

  /**
   * Disconnects from the current Buttplug server if connected.
   */
  public async disconnect(): Promise<void> {
    if (this.client && this.client.connected) {
      try {
        await this.client.disconnect();
      } catch (e) {
        console.warn('Error during disconnect:', e);
      }
    }
    this.cleanupClient();
    this.connectionStateSubject.next(ButtplugConnectionState.DISCONNECTED);
  }

  /**
   * Starts scanning for devices.
   */
  public async startScanning(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Cannot start scanning: Not connected to a server');
    }

    this.scanningSubject.next(true);
    await this.client!.startScanning();
  }

  /**
   * Stops scanning for devices.
   */
  public async stopScanning(): Promise<void> {
    if (!this.isConnected()) return;

    await this.client!.stopScanning();
    // The scanningFinished event listener will set scanningSubject to false.
  }

  /**
   * Send a vibrate command to a given device index.
   * Speed range is typically 0.0 to 1.0.
   */
  public async vibrateDevice(index: number, speed: number): Promise<void> {
    const device = this.getDeviceByIndex(index);
    if (!device) throw new Error(`No device with index ${index}`);

    if (!device.canVibrate) {
      throw new Error('Device does not support vibrate');
    }

    try {
      const bpDevice = this.getClientDevice(index);
      await bpDevice.vibrate(speed);
    } catch (e) {
      this.handleDeviceCommandError(e, 'vibrate');
    }
  }

  /**
   * Send a linear command to a given device index.
   * Position range: 0.0 to 1.0, Duration in ms.
   */
  public async linearDevice(
    index: number,
    position: number,
    duration: number
  ): Promise<void> {
    const device = this.getDeviceByIndex(index);
    if (!device) throw new Error(`No device with index ${index}`);

    if (!device.canLinear) {
      throw new Error('Device does not support linear');
    }

    try {
      const bpDevice = this.getClientDevice(index);
      await bpDevice.linear(position, duration);
    } catch (e) {
      this.handleDeviceCommandError(e, 'linear');
    }
  }

  /**
   * Send a rotate command to a given device index.
   * Speed 0.0 to 1.0, clockwise boolean.
   */
  public async rotateDevice(
    index: number,
    speed: number,
    clockwise: boolean
  ): Promise<void> {
    const device = this.getDeviceByIndex(index);
    if (!device) throw new Error(`No device with index ${index}`);

    if (!device.canRotate) {
      throw new Error('Device does not support rotate');
    }

    try {
      const bpDevice = this.getClientDevice(index);
      await bpDevice.rotate(speed, clockwise);
    } catch (e) {
      this.handleDeviceCommandError(e, 'rotate');
    }
  }

  /**
   * Stop the given device.
   */
  public async stopDevice(index: number): Promise<void> {
    const bpDevice = this.getClientDevice(index);
    const device = this.getDeviceByIndex(index);

    // Show a brief message to user:
    this.message.loading(
      'Stopping your device. It may lightly move before stopping.',
      { nzDuration: 1500 }
    );

    if (device) {
      try {
        if (device.canVibrate) {
          await bpDevice.vibrate(0.01);
        } else if (device.canRotate) {
          await bpDevice.rotate(0.01, true);
        } else if (device.canLinear) {
          await bpDevice.linear(0.01, 500);
        }
      } catch (e) {
        console.error(`Error sending gentle command before stop:`, e);
      }
    }

    // Actually stop the device
    setTimeout(
      async () =>
        await bpDevice
          .stop()
          .catch((e) => console.warn(`Stop command error:`, e)),
      1000
    );
  }

  /**
   * Stop all devices.
   */
  public async stopAllDevices(): Promise<void> {
    if (!this.client) return;

    this.message.loading(
      'Stopping all devices. They may lightly move before stopping.',
      { nzDuration: 1500 }
    );

    for (const bpDevice of this.client.devices) {
      const deviceInfo = this.getDeviceByIndex(bpDevice.index);
      if (!deviceInfo) continue;

      try {
        if (deviceInfo.canVibrate) {
          await bpDevice.vibrate(0.01);
        } else if (deviceInfo.canRotate) {
          await bpDevice.rotate(0.01, true);
        } else if (deviceInfo.canLinear) {
          await bpDevice.linear(0.01, 500);
        }
      } catch (e) {
        console.error(`Error sending gentle command before stopAll:`, e);
      }

      setTimeout(
        async () =>
          await bpDevice
            .stop()
            .catch((e) => console.warn(`StopAll command error:`, e)),
        1000
      );
    }
  }

  private isConnected(): boolean {
    return (
      this.connectionStateSubject.value === ButtplugConnectionState.CONNECTED
    );
  }

  private setupClientListeners(): void {
    if (!this.client) return;

    this.client.addListener('deviceadded', this.handleDeviceAdded);
    this.client.addListener('deviceremoved', this.handleDeviceRemoved);
    this.client.addListener('scanningfinished', this.handleScanningFinished);
    this.client.addListener('disconnect', this.handleDisconnected);
  }

  private cleanupClient(): void {
    if (!this.client) return;

    this.client.removeAllListeners();
    this.client = undefined;
    this.devicesSubject.next([]);
    this.scanningSubject.next(false);
  }

  private handleDeviceAdded = (device: ButtplugClientDevice) => {
    const newDevice: ButtplugDeviceInfo = {
      index: device.index,
      name: device.name,
      canVibrate: device.vibrateAttributes.length > 0,
      canLinear: device.messageAttributes.LinearCmd !== undefined,
      canRotate: device.messageAttributes.RotateCmd !== undefined,
    };

    const currentDevices = this.devicesSubject.value;
    this.devicesSubject.next([...currentDevices, newDevice]);
  };

  private handleDeviceRemoved = (device: ButtplugClientDevice) => {
    const currentDevices = this.devicesSubject.value;
    this.devicesSubject.next(
      currentDevices.filter((d) => d.index !== device.index)
    );
  };

  private handleScanningFinished = () => {
    this.scanningSubject.next(false);
  };

  private handleDisconnected = () => {
    this.cleanupClient();
    this.connectionStateSubject.next(ButtplugConnectionState.DISCONNECTED);
  };

  private getDeviceByIndex(index: number): ButtplugDeviceInfo | undefined {
    return this.devicesSubject.value.find((d) => d.index === index);
  }

  private getClientDevice(index: number): ButtplugClientDevice {
    if (!this.client) throw new Error('Client not connected');
    const device = this.client.devices.find((d) => d.index === index);
    if (!device)
      throw new Error(`No device with index ${index} found on client`);
    return device;
  }

  private handleDeviceCommandError(e: unknown, command: string): void {
    if (e instanceof ButtplugDeviceError) {
      console.error(`Device error on ${command}:`, e.message);
    } else if (e instanceof ButtplugError) {
      console.error(`Buttplug error on ${command}:`, e.message);
    } else {
      console.error(`Unknown error on ${command}:`, e);
    }
  }
}
