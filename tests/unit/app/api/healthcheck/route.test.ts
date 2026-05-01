import { beforeEach, describe, expect, it, vi } from 'vitest';

const healthcheckMocks = vi.hoisted(() => ({
	connectMongoose: vi.fn(),
	command: vi.fn(),
	loggerWarn: vi.fn(),
}));

vi.mock('@/shared/database/mongoose', () => ({
	connectMongoose: healthcheckMocks.connectMongoose,
}));

vi.mock('@/shared/logging/logger', () => ({
	logger: {
		warn: healthcheckMocks.loggerWarn,
	},
}));

import { GET, runtime } from '@/app/api/healthcheck/route';

describe('GET /api/healthcheck', () => {
	beforeEach(() => {
		healthcheckMocks.connectMongoose.mockReset();
		healthcheckMocks.command.mockReset();
		healthcheckMocks.loggerWarn.mockReset();
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
		const error = new Error('MongoDB unavailable');
		healthcheckMocks.connectMongoose.mockRejectedValue(error);

		const response = await GET();
		const json = await response.json();

		expect(response.status).toBe(503);
		expect(healthcheckMocks.command).not.toHaveBeenCalled();
		expect(healthcheckMocks.loggerWarn).toHaveBeenCalledWith(
			'Healthcheck failed',
			{
				check: 'database',
				error,
				route: 'GET /api/healthcheck',
				status: 503,
			},
		);
		expect(json.ok).toBe(false);
		expect(json.checks).toEqual({ database: 'failed' });
		expect(typeof json.ts).toBe('number');
	});

	it('returns 503 when the database ping fails', async () => {
		const error = new Error('MongoDB ping failed');
		healthcheckMocks.connectMongoose.mockResolvedValue({
			connection: {
				db: {
					command: healthcheckMocks.command.mockRejectedValue(error),
				},
			},
		});

		const response = await GET();
		const json = await response.json();

		expect(response.status).toBe(503);
		expect(healthcheckMocks.loggerWarn).toHaveBeenCalledWith(
			'Healthcheck failed',
			{
				check: 'database',
				error,
				route: 'GET /api/healthcheck',
				status: 503,
			},
		);
		expect(json.ok).toBe(false);
		expect(json.checks).toEqual({ database: 'failed' });
		expect(typeof json.ts).toBe('number');
	});
});
