import 'server-only';
import { parseBase64Key32 } from '../parsers';
import { createRuntimeEnvGetter } from '../cache';

/** Runtime encryption configuration parsed from server environment variables. */
export const getCryptoEnv = createRuntimeEnvGetter(() => ({
	ENCRYPTION_KEY: parseBase64Key32('ENCRYPTION_KEY'),
}));
