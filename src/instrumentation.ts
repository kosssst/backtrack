import { logger } from '@/shared/logging/logger';
import { validateRuntimeEnv } from '@/shared/config/env/startup';
import { getLoggerEnv } from '@/shared/config/env/runtime/logger-env';
import { getAuthEnv } from '@/shared/config/env/runtime/auth-env';

/**
 * Runs once when the Next.js server process starts.
 */
export function register() {
	validateRuntimeEnv();
	const { NODE_ENV, LOG_LEVEL } = getLoggerEnv();
	const { APP_ORIGIN } = getAuthEnv();
	logger.info(
		{ nodeEnv: NODE_ENV, logLevel: LOG_LEVEL, appOrigin: APP_ORIGIN },
		'Server started',
	);
}
