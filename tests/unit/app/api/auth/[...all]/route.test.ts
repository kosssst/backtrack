import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authRouteMocks = vi.hoisted(() => ({
	getAuthHandlers: vi.fn(),
	loggerError: vi.fn(),
}));

vi.mock('@/features/auth/server/auth', () => ({
	getAuthHandlers: authRouteMocks.getAuthHandlers,
}));

vi.mock('@/shared/logging/logger', () => ({
	logger: {
		error: authRouteMocks.loggerError,
	},
}));

import { GET, POST, runtime } from '@/app/api/auth/[...all]/route';

function nextRequest(url: string) {
	return new Request(url) as NextRequest;
}

describe('auth catch-all route', () => {
	beforeEach(() => {
		authRouteMocks.getAuthHandlers.mockReset();
		authRouteMocks.loggerError.mockReset();
	});

	it('uses the node runtime', () => {
		expect(runtime).toBe('nodejs');
	});

	it('delegates GET requests to Better Auth', async () => {
		const response = new Response('ok', { status: 200 });
		const getHandler = vi.fn().mockResolvedValue(response);
		authRouteMocks.getAuthHandlers.mockResolvedValue({
			GET: getHandler,
			POST: vi.fn(),
		});

		const request = nextRequest('http://localhost/api/auth/session');

		await expect(GET(request)).resolves.toBe(response);
		expect(getHandler).toHaveBeenCalledWith(request);
		expect(authRouteMocks.loggerError).not.toHaveBeenCalled();
	});

	it('delegates POST requests to Better Auth', async () => {
		const response = new Response('ok', { status: 200 });
		const postHandler = vi.fn().mockResolvedValue(response);
		authRouteMocks.getAuthHandlers.mockResolvedValue({
			GET: vi.fn(),
			POST: postHandler,
		});

		const request = nextRequest('http://localhost/api/auth/sign-in/email');

		await expect(POST(request)).resolves.toBe(response);
		expect(postHandler).toHaveBeenCalledWith(request);
		expect(authRouteMocks.loggerError).not.toHaveBeenCalled();
	});

	it('logs and rethrows GET handler failures', async () => {
		const error = new Error('Better Auth GET failed');
		const getHandler = vi.fn().mockRejectedValue(error);
		authRouteMocks.getAuthHandlers.mockResolvedValue({
			GET: getHandler,
			POST: vi.fn(),
		});

		await expect(
			GET(nextRequest('http://localhost/api/auth/session')),
		).rejects.toThrow('Better Auth GET failed');
		expect(authRouteMocks.loggerError).toHaveBeenCalledWith(
			'Auth handler failed',
			{
				error,
				route: 'GET /api/auth/[...all]',
				status: 500,
			},
		);
	});

	it('logs and rethrows POST handler setup failures', async () => {
		const error = new Error('Better Auth setup failed');
		authRouteMocks.getAuthHandlers.mockRejectedValue(error);

		await expect(
			POST(nextRequest('http://localhost/api/auth/sign-in/email')),
		).rejects.toThrow('Better Auth setup failed');
		expect(authRouteMocks.loggerError).toHaveBeenCalledWith(
			'Auth handler failed',
			{
				error,
				route: 'POST /api/auth/[...all]',
				status: 500,
			},
		);
	});
});
