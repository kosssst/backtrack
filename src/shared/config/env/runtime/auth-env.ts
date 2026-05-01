import 'server-only';
import { getServerEnv } from './server-env';

/** Runtime auth configuration parsed from server environment variables. */
export function getAuthEnv() {
	const { APP_ORIGIN, BETTER_AUTH_SECRET } = getServerEnv();

	return {
		APP_ORIGIN,
		BETTER_AUTH_SECRET,
	};
}
