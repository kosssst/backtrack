import 'server-only';
import { parseUrl, required } from '../parsers';
import { createRuntimeEnvGetter } from '../cache';

/** Runtime auth configuration parsed from server environment variables. */
export const getAuthEnv = createRuntimeEnvGetter(() => ({
	APP_ORIGIN: parseUrl('APP_ORIGIN'),
	BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
}));
