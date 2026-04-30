import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthPageProps } from '@/features/auth/types';
import { getSafeRedirectPath } from '@/features/auth/server/redirect';
import { getCurrentSession } from '@/features/auth/server/session';

/**
 * Resolves the redirect target for login/register pages and redirects away
 * authenticated users.
 */
export async function requireAnonymousAuthPage(
	searchParams: AuthPageProps['searchParams'],
) {
	const headerStore = await headers();
	const params = await searchParams;
	const redirectTo = getSafeRedirectPath(params.redirect);
	const session = await getCurrentSession(headerStore);

	if (session?.user) {
		redirect(redirectTo);
	}

	return redirectTo;
}
