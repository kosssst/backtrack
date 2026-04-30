import 'server-only';
import { parseBoolean, parseLogLevel } from '../parsers';
import { createRuntimeEnvGetter } from '../cache';

/** Runtime logging configuration parsed from server environment variables. */
export const getLoggerEnv = createRuntimeEnvGetter(() => {
	const nodeEnv =
		process.env.NODE_ENV === 'development' ||
		process.env.NODE_ENV === 'production' ||
		process.env.NODE_ENV === 'test'
			? process.env.NODE_ENV
			: 'development';

	return {
		NODE_ENV: nodeEnv,
		DEBUG: parseBoolean(process.env.DEBUG, false),
		LOG_LEVEL: parseLogLevel(
			process.env.LOG_LEVEL,
			nodeEnv === 'production' ? 'info' : 'debug',
		),
	};
});
