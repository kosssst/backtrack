import { NextResponse } from 'next/server';
import { checkDatabase } from '@/features/healthcheck/server/healthcheck.service';

/**
 * Returns a readiness health response for critical server dependencies.
 */
export async function GET() {
	try {
		await checkDatabase();
	} catch {
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
