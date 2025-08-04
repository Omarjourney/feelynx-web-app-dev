export async function requestMediaPermissions(): Promise<void> {
  if (typeof navigator === 'undefined') {
    throw new Error('Media devices are not available in this environment.');
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      'Camera and microphone access is not supported in this browser. Please try Chrome, Firefox, or Safari.'
    );
  }

  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  if (!window.isSecureContext && !isLocalhost) {
    throw new Error('A secure HTTPS connection is required for camera and microphone access.');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    // Immediately stop tracks to release devices until LiveKit publishes them
    stream.getTracks().forEach((t) => t.stop());
  } catch (err: any) {
    if (err?.name === 'NotAllowedError') {
      throw new Error('Please allow camera and microphone access in your browser and system settings.');
    }
    if (err?.name === 'NotFoundError') {
      throw new Error('No camera or microphone found. Please connect a device or try a different browser.');
    }
    throw err instanceof Error ? err : new Error(String(err));
  }
}
