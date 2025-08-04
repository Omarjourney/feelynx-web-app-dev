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
  const allowedHosts = (import.meta.env.VITE_MEDIA_HOST_WHITELIST || '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);

  const privateHostPatterns = [
    /^localhost$/,
    /^0\.0\.0\.0$/,
    /^127(?:\.\d{1,3}){3}$/,
    /^10(?:\.\d{1,3}){3}$/,
    /^192\.168(?:\.\d{1,3}){2}$/,
    /^172\.(1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}$/,
  ];

  const isAllowedHost =
    allowedHosts.includes(hostname) || privateHostPatterns.some((p) => p.test(hostname));

  if (!window.isSecureContext && !isAllowedHost) {
    throw new Error('A secure HTTPS connection is required for camera and microphone access.');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    // Immediately stop tracks to release devices until LiveKit publishes them
    stream.getTracks().forEach((t) => t.stop());
  } catch (err: unknown) {
    const errorName = (err as { name?: string })?.name;
    if (errorName === 'NotAllowedError') {
      throw new Error('Please allow camera and microphone access in your browser and system settings.');
    }
    if (errorName === 'NotFoundError') {
      throw new Error('No camera or microphone found. Please connect a device or try a different browser.');
    }
    if (errorName === 'NotReadableError') {
      throw new Error('Unable to access camera or microphone. They might be in use by another application.');
    }
    if (errorName === 'OverconstrainedError') {
      throw new Error(
        "The requested camera or microphone settings aren't supported by your device. Try different settings or a different device.",
      );
    }
    if (errorName === 'SecurityError') {
      throw new Error(
        'Camera or microphone access was blocked due to security restrictions. Check your browser settings.',
      );
    }
    throw err instanceof Error ? err : new Error(String(err));
  }
}
