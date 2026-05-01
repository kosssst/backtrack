import 'server-only';
import { getServerEnv } from './server-env';

/** Runtime encryption configuration parsed from server environment variables. */
export function getCryptoEnv() {
	const { ENCRYPTION_KEY } = getServerEnv();

	return {
		ENCRYPTION_KEY,
	};
}
