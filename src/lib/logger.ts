import 'server-only';
import pino from 'pino';

const nodeEnv = process.env.NODE_ENV ?? 'production';
const isProd = nodeEnv === 'production';

const logLevel = (() => {
	const value = process.env.LOG_LEVEL;

	switch (value) {
		case 'debug':
		case 'info':
		case 'warn':
		case 'error':
			return value;
		default:
			return isProd ? 'info' : 'debug';
	}
})();

export const logger = pino({
	level: logLevel,

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
