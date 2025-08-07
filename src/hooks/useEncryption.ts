import { useCallback, useEffect, useState } from 'react';
import sodium from 'libsodium-wrappers';

export const useEncryption = (key: Uint8Array) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
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
        nonce: sodium.to_base64(nonce)
      };
    },
    [ready, key]
  );

  const decrypt = useCallback(
    (cipher: string, nonce: string) => {
      if (!ready) return '';
      const c = sodium.from_base64(cipher);
      const n = sodium.from_base64(nonce);
      const message = sodium.crypto_secretbox_open_easy(c, n, key);
      return sodium.to_string(message);
    },
    [ready, key]
  );

  return { encrypt, decrypt, ready };
};

export default useEncryption;
