import 'server-only';
import {parseUrl, required} from '../parsers';

let cached: {
	APP_ORIGIN: string,
	BETTER_AUTH_SECRET: string,
} | undefined;

export function getAuthEnv() {
	if (cached) return cached;
	cached = {
		APP_ORIGIN: parseUrl('APP_ORIGIN'),
		BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
	};
	return cached;
}
