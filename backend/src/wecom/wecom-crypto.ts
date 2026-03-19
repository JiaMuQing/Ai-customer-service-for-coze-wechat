import * as crypto from 'crypto';

/**
 * WeCom callback message decrypt.
 * EncodingAESKey: 43 chars, base64 decode -> 32 bytes (AES key).
 * IV: first 16 bytes of key.
 * Decrypted content: 16 random bytes + 4 bytes length (big-endian) + msg + corpId
 */
export function decrypt(
  encrypted: string,
  encodingAesKey: string,
  corpId: string,
): string {
  const key = Buffer.from(encodingAesKey + '=', 'base64');
  if (key.length !== 32) {
    throw new Error('Invalid EncodingAESKey length');
  }
  const iv = key.subarray(0, 16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let dec = decipher.update(encrypted, 'base64', 'utf8');
  dec += decipher.final('utf8');
  const buf = Buffer.from(dec, 'utf8');
  const msgLen = buf.readUInt32BE(16);
  const msg = buf.subarray(20, 20 + msgLen).toString('utf8');
  return msg;
}

export function getSignature(token: string, timestamp: string, nonce: string, encrypt: string): string {
  const arr = [token, timestamp, nonce, encrypt].sort();
  const str = arr.join('');
  return crypto.createHash('sha1').update(str).digest('hex');
}
