import 'server-only';
import pino from 'pino';
import { env } from '@/lib/env';

const isProd = env.NODE_ENV === 'production';

export const logger = pino({
	level: env.LOG_LEVEL ?? (isProd ? 'info' : 'debug'),

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
