export const isBluetoothSupported = () => 'bluetooth' in navigator;

export async function requestBluetoothDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice> {
  if (!isBluetoothSupported()) {
    throw new Error('Web Bluetooth API is not supported in this browser');
  }

  const device = await (navigator as any).bluetooth.requestDevice(
    options ?? { acceptAllDevices: true },
  );
}
