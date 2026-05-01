import { getServerEnv } from './runtime/server-env';

/**
 * Forces required runtime configuration to be parsed during server startup.
 */
export function validateRuntimeEnv() {
	getServerEnv();
}
