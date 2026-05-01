import 'server-only';
import { getServerEnv } from './server-env';

/** Runtime database configuration parsed from server environment variables. */
export function getDbEnv() {
	const { MONGODB_URL } = getServerEnv();

	return {
		MONGODB_URL,
	};
}
