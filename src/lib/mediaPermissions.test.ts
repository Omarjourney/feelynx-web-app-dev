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
    // @ts-ignore
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };
    await expect(requestMediaPermissions()).resolves.toBeUndefined();
    expect(mockGetUserMedia).toHaveBeenCalled();
  });

  it('throws friendly error on NotAllowedError', async () => {
    const error = new DOMException('denied', 'NotAllowedError');
    const mockGetUserMedia = vi.fn().mockRejectedValue(error);
    // @ts-ignore
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };
    await expect(requestMediaPermissions()).rejects.toThrow(
      'Please allow camera and microphone access',
    );
  });

  it('throws friendly error on NotFoundError', async () => {
    const error = new DOMException('not found', 'NotFoundError');
    const mockGetUserMedia = vi.fn().mockRejectedValue(error);
    // @ts-ignore
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };
    await expect(requestMediaPermissions()).rejects.toThrow(
      'No camera or microphone found',
    );
  });
});
