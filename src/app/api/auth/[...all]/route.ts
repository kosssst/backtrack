import type { NextRequest } from 'next/server';
import { getAuthHandlers } from '@/lib/auth/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
	const { GET } = await getAuthHandlers();
	return GET(request);
}

export async function POST(request: NextRequest) {
	const { POST } = await getAuthHandlers();
	return POST(request);
}
