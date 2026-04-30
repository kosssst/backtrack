import { beforeEach, describe, expect, it, vi } from 'vitest';

const sessionMocks = vi.hoisted(() => ({
	headers: vi.fn(),
	getSession: vi.fn(),
}));

vi.mock('next/headers', () => ({
	headers: sessionMocks.headers,
}));

vi.mock('@/features/auth/server/auth', () => ({
	getAuth: vi.fn(() => ({
		api: {
			getSession: sessionMocks.getSession,
		},
	})),
}));

import { getCurrentSession } from '@/features/auth/server/session';

describe('getCurrentSession', () => {
	beforeEach(() => {
		sessionMocks.headers.mockReset();
		sessionMocks.getSession.mockReset();
	});

	it('uses the supplied headers when they are provided', async () => {
		const requestHeaders = new Headers({ cookie: 'sid=123' });
		const session = { user: { id: 'user-1' } };
		sessionMocks.getSession.mockResolvedValue(session);

		await expect(getCurrentSession(requestHeaders)).resolves.toBe(session);

		expect(sessionMocks.headers).not.toHaveBeenCalled();
		expect(sessionMocks.getSession).toHaveBeenCalledWith({
			headers: requestHeaders,
		});
	});

	it('reads headers from the current request when none are supplied', async () => {
		const requestHeaders = new Headers({ cookie: 'sid=abc' });
		const session = { user: { id: 'user-2' } };
		sessionMocks.headers.mockResolvedValue(requestHeaders);
		sessionMocks.getSession.mockResolvedValue(session);

		await expect(getCurrentSession()).resolves.toBe(session);

		expect(sessionMocks.headers).toHaveBeenCalledTimes(1);
		expect(sessionMocks.getSession).toHaveBeenCalledWith({
			headers: requestHeaders,
		});
	});
});
