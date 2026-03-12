import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    ENCRYPTION_KEY: Buffer.alloc(32, 7),
  },
}));

import { decrypt, encrypt } from '@/lib/encryption/aes-265-gcm';

describe('aes-256-gcm encryption helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('encrypts and decrypts plaintext for the same user', async () => {
    const encrypted = await encrypt('very secret text', 'user-1');

    expect(encrypted.alg).toBe('aes-256-gcm');
    expect(Buffer.isBuffer(encrypted.iv)).toBe(true);
    expect(Buffer.isBuffer(encrypted.ct)).toBe(true);
    expect(Buffer.isBuffer(encrypted.tag)).toBe(true);

    const decrypted = await decrypt(encrypted, 'user-1');
    expect(decrypted).toBe('very secret text');
  });

  it('fails to decrypt with a different user id because AAD changes', async () => {
    const encrypted = await encrypt('very secret text', 'user-1');

    await expect(decrypt(encrypted, 'user-2')).rejects.toThrow();
  });

  it('rejects unsupported algorithms', async () => {
    await expect(
      decrypt(
        {
          alg: 'wrong-alg',
          iv: Buffer.alloc(12),
          ct: Buffer.from('abc'),
          tag: Buffer.alloc(16),
        } as never,
        'user-1',
      ),
    ).rejects.toThrow('Unsupported alg: wrong-alg');
  });
});
