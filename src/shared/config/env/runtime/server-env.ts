import 'server-only';
import { createRuntimeEnvGetter } from '../cache';
import {
	parseBase64Key32,
	parseBoolean,
	parseLogLevel,
	parseMongoUrl,
	parseUrl,
	required,
} from '../parsers';

function readNodeEnv() {
	const value = process.env.NODE_ENV;

	if (value === 'development' || value === 'production' || value === 'test') {
		return value;
	}

	return 'development';
}

export function readLoggerEnv() {
	const NODE_ENV = readNodeEnv();

	return {
		NODE_ENV,
		DEBUG: parseBoolean(process.env.DEBUG, false),
		LOG_LEVEL: parseLogLevel(
			process.env.LOG_LEVEL,
			NODE_ENV === 'production' ? 'info' : 'debug',
		),
	};
}

/**
 * Canonical runtime configuration parsed from server environment variables.
 */
export const getServerEnv = createRuntimeEnvGetter(() => {
	return {
		APP_ORIGIN: parseUrl('APP_ORIGIN'),
		MONGODB_URL: parseMongoUrl('MONGODB_URL'),
		ENCRYPTION_KEY: parseBase64Key32('ENCRYPTION_KEY'),
		BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
		...readLoggerEnv(),
	};
});
