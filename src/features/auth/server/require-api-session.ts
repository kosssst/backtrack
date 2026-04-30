import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/features/auth/server/session';

/**
 * Requires an authenticated Better Auth session for API route handlers.
 */
export async function requireApiSession(request: Request) {
	const session = await getCurrentSession(request.headers);

	if (!session?.user) {
		return {
			session: null,
			errorResponse: NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			),
		};
	}

	return {
		session,
		errorResponse: null,
	};
}
