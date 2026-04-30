import 'server-only';
import { parseMongoUrl } from '../parsers';

let cached: { MONGODB_URL: string } | undefined;

export function getDbEnv() {
	if (cached) return cached;
	cached = {
		MONGODB_URL: parseMongoUrl('MONGODB_URL'),
	};
	return cached;
}
