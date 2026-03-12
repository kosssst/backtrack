import { beforeEach, describe, expect, it, vi } from 'vitest';

const sessionMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  json: vi.fn((body: unknown, init?: { status?: number }) => ({
    body,
    status: init?.status ?? 200,
  })),
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: {
    api: {
      getSession: sessionMocks.getSession,
    },
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: sessionMocks.json,
  },
}));

import { requireApiSession } from '@/lib/auth/require-api-session';

describe('requireApiSession', () => {
  beforeEach(() => {
    sessionMocks.getSession.mockReset();
    sessionMocks.json.mockClear();
  });

  it('returns an unauthorized error response when there is no user session', async () => {
    sessionMocks.getSession.mockResolvedValue(null);

    const result = await requireApiSession(new Request('http://localhost/api/posts'));

    expect(result.session).toBeNull();
    expect(result.errorResponse).toEqual({
      body: { error: 'Unauthorized' },
      status: 401,
    });
  });

  it('returns the session and no error response when the session is valid', async () => {
    const session = { user: { id: 'user-1' } };
    sessionMocks.getSession.mockResolvedValue(session);

    const result = await requireApiSession(new Request('http://localhost/api/posts'));

    expect(result.session).toEqual(session);
    expect(result.errorResponse).toBeNull();
  });
});
