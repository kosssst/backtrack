import { beforeEach, describe, expect, it, vi } from 'vitest';

const healthcheckMocks = vi.hoisted(() => ({
	connectMongoose: vi.fn(),
	command: vi.fn(),
}));

vi.mock('@/shared/database/mongoose', () => ({
	connectMongoose: healthcheckMocks.connectMongoose,
}));

import { GET, runtime } from '@/app/api/healthcheck/route';

describe('GET /api/healthcheck', () => {
	beforeEach(() => {
		healthcheckMocks.connectMongoose.mockReset();
		healthcheckMocks.command.mockReset();
	});

	it('uses the node runtime', () => {
		expect(runtime).toBe('nodejs');
	});

	it('returns 200 when the database ping succeeds', async () => {
		healthcheckMocks.connectMongoose.mockResolvedValue({
			connection: {
				db: {
					command: healthcheckMocks.command.mockResolvedValue({ ok: 1 }),
				},
			},
		});

		const response = await GET();
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(healthcheckMocks.connectMongoose).toHaveBeenCalledTimes(1);
		expect(healthcheckMocks.command).toHaveBeenCalledWith(
			{ ping: 1 },
			{ timeoutMS: 1000 },
		);
		expect(json.ok).toBe(true);
		expect(json.checks).toEqual({ database: 'ok' });
		expect(typeof json.ts).toBe('number');
	});

	it('returns 503 when connecting to the database fails', async () => {
		healthcheckMocks.connectMongoose.mockRejectedValue(
			new Error('MongoDB unavailable'),
		);

		const response = await GET();
		const json = await response.json();

		expect(response.status).toBe(503);
		expect(healthcheckMocks.command).not.toHaveBeenCalled();
		expect(json.ok).toBe(false);
		expect(json.checks).toEqual({ database: 'failed' });
		expect(typeof json.ts).toBe('number');
	});

	it('returns 503 when the database ping fails', async () => {
		healthcheckMocks.connectMongoose.mockResolvedValue({
			connection: {
				db: {
					command: healthcheckMocks.command.mockRejectedValue(
						new Error('MongoDB ping failed'),
					),
				},
			},
		});

		const response = await GET();
		const json = await response.json();

		expect(response.status).toBe(503);
		expect(json.ok).toBe(false);
		expect(json.checks).toEqual({ database: 'failed' });
		expect(typeof json.ts).toBe('number');
	});
});
