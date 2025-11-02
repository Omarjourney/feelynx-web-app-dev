import { useCallback, useEffect, useState } from 'react';
import sodium from 'libsodium-wrappers';

/**
 * Hook that exposes symmetric encryption helpers backed by libsodium.
 *
 * The hook waits for the wasm bundle to initialise before enabling the
 * returned helpers. Consumers should check the `ready` flag to avoid
 * encrypting or decrypting before libsodium is available.
 *
 * @param key - Pre-shared symmetric key used with the secretbox APIs.
 * @returns Encryption utilities and a readiness flag for the sodium runtime.
 */
export const useEncryption = (key: Uint8Array) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait for libsodium's WASM runtime to finish loading before exposing helpers.
    const init = async () => {
      await sodium.ready;
      setReady(true);
    };
    init();
  }, []);

  const encrypt = useCallback(
    (text: string) => {
      if (!ready) return { cipher: '', nonce: '' };
      const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
      const message = sodium.from_string(text);
      const cipher = sodium.crypto_secretbox_easy(message, nonce, key);
      return {
        cipher: sodium.to_base64(cipher),
        nonce: sodium.to_base64(nonce),
      };
    },
    [ready, key],
  );

  const decrypt = useCallback(
    (cipher: string, nonce: string) => {
      if (!ready) return '';
      const c = sodium.from_base64(cipher);
      const n = sodium.from_base64(nonce);
      const message = sodium.crypto_secretbox_open_easy(c, n, key);
      return sodium.to_string(message);
    },
    [ready, key],
  );

  return { encrypt, decrypt, ready };
};

export default useEncryption;
