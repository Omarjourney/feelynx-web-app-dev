// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestMediaPermissions } from './mediaPermissions';

describe('requestMediaPermissions', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      configurable: true,
    });
  });

  it('resolves when permissions are granted', async () => {
    const mockGetUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [] });
    // @ts-expect-error mock mediaDevices
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };
    await expect(requestMediaPermissions()).resolves.toBeUndefined();
    expect(mockGetUserMedia).toHaveBeenCalled();
  });

  it('throws friendly error on NotAllowedError', async () => {
    const error = new DOMException('denied', 'NotAllowedError');
    const mockGetUserMedia = vi.fn().mockRejectedValue(error);
    // @ts-expect-error mock mediaDevices
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };
    await expect(requestMediaPermissions()).rejects.toThrow(
      'Please allow camera and microphone access',
    );
  });

  it('throws friendly error on NotFoundError', async () => {
    const error = new DOMException('not found', 'NotFoundError');
    const mockGetUserMedia = vi.fn().mockRejectedValue(error);
    // @ts-expect-error mock mediaDevices
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };
    await expect(requestMediaPermissions()).rejects.toThrow(
      'No camera or microphone found',
    );
  });

  it('throws friendly error on NotReadableError', async () => {
    const error = new DOMException('busy', 'NotReadableError');
    const mockGetUserMedia = vi.fn().mockRejectedValue(error);
    // @ts-expect-error mock mediaDevices
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };
    await expect(requestMediaPermissions()).rejects.toThrow(
      'Unable to access camera or microphone',
    );
  });

  it('throws friendly error on OverconstrainedError', async () => {
    const error = new DOMException('constraints', 'OverconstrainedError');
    const mockGetUserMedia = vi.fn().mockRejectedValue(error);
    // @ts-expect-error mock mediaDevices
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };
    await expect(requestMediaPermissions()).rejects.toThrow(
      "The requested camera or microphone settings aren't supported",
    );
  });

  it('throws friendly error on SecurityError', async () => {
    const error = new DOMException('security', 'SecurityError');
    const mockGetUserMedia = vi.fn().mockRejectedValue(error);
    // @ts-expect-error mock mediaDevices
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };
    await expect(requestMediaPermissions()).rejects.toThrow(
      'Camera or microphone access was blocked',
    );
  });
});
