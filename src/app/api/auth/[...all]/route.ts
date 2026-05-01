import type { NextRequest } from 'next/server';
import { getAuthHandlers } from '@/features/auth/server/auth';
import { logger } from '@/shared/logging/logger';

/** Better Auth requires the Node.js runtime for database-backed session handling. */
export const runtime = 'nodejs';

/**
 * Delegates Better Auth GET requests to the generated Next.js handler.
 */
export async function GET(request: NextRequest) {
	try {
		const { GET } = await getAuthHandlers();
		return await GET(request);
	} catch (error) {
		logger.error('Auth handler failed', {
			error,
			route: 'GET /api/auth/[...all]',
			status: 500,
		});
		throw error;
	}
}

/**
 * Delegates Better Auth POST requests to the generated Next.js handler.
 */
export async function POST(request: NextRequest) {
	try {
		const { POST } = await getAuthHandlers();
		return await POST(request);
	} catch (error) {
		logger.error('Auth handler failed', {
			error,
			route: 'POST /api/auth/[...all]',
			status: 500,
		});
		throw error;
	}
}
