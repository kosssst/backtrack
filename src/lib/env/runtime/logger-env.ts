import 'server-only';
import { parseBoolean, parseLogLevel } from '../parsers';

let cached:
	| {
			NODE_ENV: 'development' | 'production' | 'test';
			DEBUG: boolean;
			LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
	  }
	| undefined;

export function getLoggerEnv() {
	if (cached) return cached;

	const nodeEnv =
		process.env.NODE_ENV === 'development' ||
		process.env.NODE_ENV === 'production' ||
		process.env.NODE_ENV === 'test'
			? process.env.NODE_ENV
			: 'development';

	cached = {
		NODE_ENV: nodeEnv,
		DEBUG: parseBoolean(process.env.DEBUG, false),
		LOG_LEVEL: parseLogLevel(
			process.env.LOG_LEVEL,
			nodeEnv === 'production' ? 'info' : 'debug',
		),
	};

	return cached;
}
