import 'server-only';
import pino from 'pino';
import { getLoggerEnv } from '@/shared/config/env/runtime/logger-env';

const { NODE_ENV, LOG_LEVEL } = getLoggerEnv();
const isProd = NODE_ENV === 'production';

/** Server logger with redaction for common credential fields. */
export const logger = pino({
	level: LOG_LEVEL,

	// Keep common credential fields out of logs even when errors include request context.
	redact: {
		paths: [
			'req.headers.authorization',
			'req.headers.cookie',
			'*.password',
			'*.token',
			'*.access_token',
			'*.refresh_token',
		],
		censor: '[REDACTED]',
	},

	base: {
		service: 'backtrack',
	},

	transport: isProd
		? undefined
		: {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:standard',
					ignore: 'pid,hostname',
				},
			},
});
