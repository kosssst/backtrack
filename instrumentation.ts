import { env } from "./lib/env";
import { logger } from "./lib/logger";

export function register() {
	logger.info(
		{ nodeEnv: env.NODE_ENV, appOrigin: env.APP_ORIGIN },
		"Server started and env validated"
	);
}
