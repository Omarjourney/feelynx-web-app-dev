export const isBluetoothSupported = () => 'bluetooth' in navigator;

export async function requestBluetoothDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice> {
  if (!isBluetoothSupported()) {
    throw new Error('Web Bluetooth API is not supported in this browser');
  }

  const navigatorWithBluetooth = navigator as Navigator & {
    bluetooth: {
      requestDevice: (request?: RequestDeviceOptions) => Promise<BluetoothDevice>;
    };
  };

  return navigatorWithBluetooth.bluetooth.requestDevice(
    options ?? { acceptAllDevices: true }
  );
}
