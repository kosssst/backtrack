import 'server-only';
import { parseMongoUrl } from '../parsers';
import { createRuntimeEnvGetter } from '../cache';

/** Runtime database configuration parsed from server environment variables. */
export const getDbEnv = createRuntimeEnvGetter(() => ({
	MONGODB_URL: parseMongoUrl('MONGODB_URL'),
}));
