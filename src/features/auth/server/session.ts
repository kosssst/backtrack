import 'server-only';

import { headers } from 'next/headers';
import { getAuth } from '@/features/auth/server/auth';

type HeaderStore = Awaited<ReturnType<typeof headers>>;
type SessionHeaders = HeaderStore | Headers;

/**
 * Returns the Better Auth session for the current server request.
 *
 * Accepting a header store lets layouts/pages reuse a single `headers()` call
 * when they also need to inspect request metadata such as `x-return-to`.
 */
export async function getCurrentSession(headerStore?: SessionHeaders) {
	const requestHeaders = headerStore ?? (await headers());
	const auth = await getAuth();

	return auth.api.getSession({
		headers: requestHeaders,
	});
}
