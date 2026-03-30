import crypto from 'crypto';
import { AES256GCMEncryptedData } from '@/types/encryption.types';
import { getCryptoEnv } from '@/lib/env/runtime/crypto-env';

function makeAAD(userId: string) {
	return Buffer.from(`user:${userId}`, 'utf8');
}

export async function encrypt(plaintext: string, userId: string) {
	const { ENCRYPTION_KEY } = getCryptoEnv();
	const iv = crypto.randomBytes(12);

	const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
	cipher.setAAD(makeAAD(userId));

	const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();

	return {
		alg: 'aes-256-gcm',
		iv,
		ct,
		tag,
	} as AES256GCMEncryptedData;
}

export async function decrypt(
	encryptedData: AES256GCMEncryptedData,
	userId: string,
) {
	const { ENCRYPTION_KEY } = getCryptoEnv();
	if (encryptedData.alg !== 'aes-256-gcm')
		throw new Error(`Unsupported alg: ${encryptedData.alg}`);

	const decipher = crypto.createDecipheriv(
		'aes-256-gcm',
		ENCRYPTION_KEY,
		encryptedData.iv,
	);
	decipher.setAAD(makeAAD(userId));
	decipher.setAuthTag(encryptedData.tag);

	const pt = Buffer.concat([
		decipher.update(encryptedData.ct),
		decipher.final(),
	]);
	return pt.toString('utf8');
}
