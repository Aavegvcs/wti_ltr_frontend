import CryptoJS from 'crypto-js';

export const CONFIG_ENCRYPT = {
  port: process.env.NEXT_PUBLIC_PORT || '3000',
  appSecret: process.env.NEXT_PUBLIC_APP_SECRET || '',
  encKey: process.env.NEXT_PUBLIC_ENC_KEY || '',

};
  console.log('CONFIG_ENCRYPT.encKey', process.env.NEXT_PUBLIC_ENC_KEY)
export async function encryptData(data: any) {
  if (!CONFIG_ENCRYPT.encKey) {
        throw new Error('Encryption key is missing.');
    }

    // Backend-defined IV (must be 16 bytes)
    const IV_STRING = '\f\r\f!!,\u0003",,\t-\u001c,\u0016\u0002';
    const iv = CryptoJS.enc.Utf8.parse(IV_STRING);
    const key = CryptoJS.enc.Utf8.parse(CONFIG_ENCRYPT.encKey);

    // Encrypt Data
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    // Return encrypted data as a Base64 string
    return encrypted.toString();
}

// ✅ Corrected Decryption Function
export async function decryptData(encrypted: string) {
    if (!CONFIG_ENCRYPT.encKey) {
        throw new Error('Encryption key is missing.');
    }

    const IV_STRING = '\f\r\f!!,\u0003",,\t-\u001c,\u0016\u0002';
    const iv = CryptoJS.enc.Utf8.parse(IV_STRING);
    const key = CryptoJS.enc.Utf8.parse(CONFIG_ENCRYPT.encKey);

    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    // Convert to UTF-8 and parse JSON
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
        throw new Error("Decryption failed: Empty result. Check IV, Key, or Encoding.");
    }

    return JSON.parse(decryptedText);
}
