import 'server-only';
import { parseBase64Key32 } from '../parsers';

let cached: { ENCRYPTION_KEY: Buffer } | undefined;

export function getCryptoEnv() {
	if (cached) return cached;
	cached = {
		ENCRYPTION_KEY: parseBase64Key32('ENCRYPTION_KEY'),
	};
	return cached;
}
