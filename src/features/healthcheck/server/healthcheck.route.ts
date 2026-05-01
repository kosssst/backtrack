import { NextResponse } from 'next/server';
import { checkDatabase } from '@/features/healthcheck/server/healthcheck.service';
import { logger } from '@/shared/logging/logger';

/**
 * Returns a readiness health response for critical server dependencies.
 */
export async function GET() {
	try {
		await checkDatabase();
	} catch (error) {
		logger.warn('Healthcheck failed', {
			check: 'database',
			error,
			route: 'GET /api/healthcheck',
			status: 503,
		});
		return NextResponse.json(
			{
				ok: false,
				checks: {
					database: 'failed',
				},
				ts: Date.now(),
			},
			{ status: 503 },
		);
	}

	return NextResponse.json(
		{
			ok: true,
			checks: {
				database: 'ok',
			},
			ts: Date.now(),
		},
		{ status: 200 },
	);
}
