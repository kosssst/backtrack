/** Healthcheck runs in Node.js to match the deployed server runtime. */
export const runtime = 'nodejs';

/**
 * Returns a lightweight process health response.
 */
export async function GET() {
	return Response.json({
		ok: true,
		ts: Date.now(),
	});
}
