import { getAuthEnv } from './runtime/auth-env';
import { getDbEnv } from './runtime/db-env';
import { getCryptoEnv } from './runtime/crypto-env';

/**
 * Forces required runtime configuration to be parsed during server startup.
 */
export function validateRuntimeEnv() {
	getAuthEnv();
	getDbEnv();
	getCryptoEnv();
}
