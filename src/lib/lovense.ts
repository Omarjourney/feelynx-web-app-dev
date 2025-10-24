import { requestBluetoothDevice, isBluetoothSupported } from './bluetooth';

const LUSH_SERVICE_UUID = 0xfff0;
const COMMAND_CHAR_UUID = 0xfff1;

export class LovenseToy {
  private device?: BluetoothDevice;
  private characteristic?: BluetoothRemoteGATTCharacteristic;

  async pair() {
    if (!isBluetoothSupported()) {
      throw new Error('Web Bluetooth API is not available');
    }

    this.device = await requestBluetoothDevice({
      filters: [{ namePrefix: 'Lovense' }],
      optionalServices: [LUSH_SERVICE_UUID],
    });

    const server = await this.device.gatt?.connect();
    if (!server) {
      throw new Error('Unable to connect to Lovense device');
    }
    const service = await server.getPrimaryService(LUSH_SERVICE_UUID);
    this.characteristic = await service.getCharacteristic(COMMAND_CHAR_UUID);
  }

  async disconnect() {
    await this.device?.gatt?.disconnect();
    this.device = undefined;
    this.characteristic = undefined;
  }

  async vibrate(level: number) {
    if (!this.characteristic) {
      throw new Error('Toy is not paired');
    }
    const intensity = Math.max(0, Math.min(level, 20));
    const command = `Vibrate:${intensity};`;
    const data = new TextEncoder().encode(command);
    await this.characteristic.writeValue(data);
  }
}
