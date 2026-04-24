import { logger } from './lib/logger';
import { validateRuntimeEnv } from '@/lib/env/startup';
import { getLoggerEnv } from '@/lib/env/runtime/logger-env';
import { getAuthEnv } from '@/lib/env/runtime/auth-env';

export function register() {
	validateRuntimeEnv();
	const { NODE_ENV, LOG_LEVEL } = getLoggerEnv();
	const { APP_ORIGIN } = getAuthEnv();
	logger.info(
		{ nodeEnv: NODE_ENV, logLevel: LOG_LEVEL, appOrigin: APP_ORIGIN },
		'Server started',
	);
}
