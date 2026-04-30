import type { NextRequest } from 'next/server';
import { getAuthHandlers } from '@/features/auth/server/auth';

/** Better Auth requires the Node.js runtime for database-backed session handling. */
export const runtime = 'nodejs';

/**
 * Delegates Better Auth GET requests to the generated Next.js handler.
 */
export async function GET(request: NextRequest) {
	const { GET } = await getAuthHandlers();
	return GET(request);
}

/**
 * Delegates Better Auth POST requests to the generated Next.js handler.
 */
export async function POST(request: NextRequest) {
	const { POST } = await getAuthHandlers();
	return POST(request);
}
