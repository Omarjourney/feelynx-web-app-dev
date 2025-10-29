export const isBluetoothSupported = () => 'bluetooth' in navigator;
export const isSecureContextSupported = () =>
  typeof window !== 'undefined' && window.isSecureContext === true;

export async function requestBluetoothDevice(
  options?: RequestDeviceOptions,
): Promise<BluetoothDevice> {
  if (!isBluetoothSupported())
    throw new Error('Web Bluetooth API is not supported in this browser');
  if (!isSecureContextSupported()) throw new Error('Bluetooth requires HTTPS (secure context)');

  const device = await (navigator as any).bluetooth.requestDevice(
    options ?? { acceptAllDevices: true },
  );
  return device as BluetoothDevice;
}
