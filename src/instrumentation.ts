import { getEnv } from './lib/env';
import { logger } from './lib/logger';

export function register() {
	const env = getEnv();
	logger.info(
		{ nodeEnv: env.NODE_ENV, appOrigin: env.APP_ORIGIN },
		'Server started and env validated',
	);
}
