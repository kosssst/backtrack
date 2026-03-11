import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export async function requireApiSession(request: Request) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

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
