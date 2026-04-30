import { getAuthEnv } from './runtime/auth-env';
import { getDbEnv } from './runtime/db-env';
import { getCryptoEnv } from './runtime/crypto-env';

export function validateRuntimeEnv() {
	getAuthEnv();
	getDbEnv();
	getCryptoEnv();
}
