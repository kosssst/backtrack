import 'server-only';
import { parseUrl } from '../parsers';

let cached: { APP_ORIGIN: string } | undefined;

export function getAuthEnv() {
	if (cached) return cached;
	cached = {
		APP_ORIGIN: parseUrl('APP_ORIGIN'),
	};
	return cached;
}
