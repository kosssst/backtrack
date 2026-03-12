import { beforeEach, describe, expect, it, vi } from 'vitest';

const routeMocks = vi.hoisted(() => ({
  requireApiSession: vi.fn(),
  connectMongoose: vi.fn(),
  encrypt: vi.fn(),
  decrypt: vi.fn(),
  countDocuments: vi.fn(),
  create: vi.fn(),
  find: vi.fn(),
}));

vi.mock('@/lib/auth/require-api-session', () => ({
  requireApiSession: routeMocks.requireApiSession,
}));

vi.mock('@/lib/db/mongoose', () => ({
  connectMongoose: routeMocks.connectMongoose,
}));

vi.mock('@/lib/encryption/aes-265-gcm', () => ({
  encrypt: routeMocks.encrypt,
  decrypt: routeMocks.decrypt,
}));

vi.mock('@/models/posts.model', () => ({
  Posts: {
    countDocuments: routeMocks.countDocuments,
    create: routeMocks.create,
    find: routeMocks.find,
  },
}));

import { GET, POST, runtime } from '@/app/api/posts/route';

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeQueryResult(docs: unknown[]) {
  const query = {
    sort: vi.fn(() => query),
    skip: vi.fn(() => query),
    limit: vi.fn(async () => docs),
  };
  return query;
}

describe('posts route', () => {
  beforeEach(() => {
    routeMocks.requireApiSession.mockReset();
    routeMocks.connectMongoose.mockReset();
    routeMocks.encrypt.mockReset();
    routeMocks.decrypt.mockReset();
    routeMocks.countDocuments.mockReset();
    routeMocks.create.mockReset();
    routeMocks.find.mockReset();
  });

  it('uses the node runtime', () => {
    expect(runtime).toBe('nodejs');
  });

  it('returns the auth error response when POST is unauthorized', async () => {
    routeMocks.requireApiSession.mockResolvedValue({
      session: null,
      errorResponse: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    });

    const response = await POST(jsonRequest('http://localhost/api/posts', { title: 'x', body: 'y' }));

    expect(response.status).toBe(401);
  });

  it('rejects invalid POST payloads', async () => {
    routeMocks.requireApiSession.mockResolvedValue({
      session: { user: { id: 'user-1' } },
      errorResponse: null,
    });

    const badTitle = await POST(jsonRequest('http://localhost/api/posts', { title: '', body: 'body' }));
    const badBody = await POST(jsonRequest('http://localhost/api/posts', { title: 'title', body: '' }));

    expect(badTitle.status).toBe(400);
    expect(await badTitle.json()).toEqual({ message: 'Invalid title' });
    expect(badBody.status).toBe(400);
    expect(await badBody.json()).toEqual({ message: 'Invalid content' });
  });

  it('creates an encrypted post on valid POST', async () => {
    routeMocks.requireApiSession.mockResolvedValue({
      session: { user: { id: 'user-1' } },
      errorResponse: null,
    });
    routeMocks.encrypt
      .mockResolvedValueOnce({ alg: 'aes-256-gcm', iv: Buffer.from('iv1'), ct: Buffer.from('ct1'), tag: Buffer.from('tag1') })
      .mockResolvedValueOnce({ alg: 'aes-256-gcm', iv: Buffer.from('iv2'), ct: Buffer.from('ct2'), tag: Buffer.from('tag2') });
    routeMocks.create.mockResolvedValue({ _id: 'post-1' });

    const response = await POST(
      jsonRequest('http://localhost/api/posts', {
        title: 'My title',
        body: 'My body',
      }),
    );

    expect(routeMocks.connectMongoose).toHaveBeenCalledTimes(1);
    expect(routeMocks.encrypt).toHaveBeenNthCalledWith(1, 'My title', 'user-1');
    expect(routeMocks.encrypt).toHaveBeenNthCalledWith(2, 'My body', 'user-1');
    expect(routeMocks.create).toHaveBeenCalledWith({
      titleEnc: {
        v: 1,
        alg: 'aes-256-gcm',
        iv: Buffer.from('iv1'),
        ct: Buffer.from('ct1'),
        tag: Buffer.from('tag1'),
      },
      bodyEnc: {
        v: 1,
        alg: 'aes-256-gcm',
        iv: Buffer.from('iv2'),
        ct: Buffer.from('ct2'),
        tag: Buffer.from('tag2'),
      },
      authorId: 'user-1',
    });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ _id: 'post-1' });
  });

  it('returns the auth error response when GET is unauthorized', async () => {
    routeMocks.requireApiSession.mockResolvedValue({
      session: null,
      errorResponse: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    });

    const response = await GET(new Request('http://localhost/api/posts'));

    expect(response.status).toBe(401);
  });

  it('rejects a page number above maxPage', async () => {
    routeMocks.requireApiSession.mockResolvedValue({
      session: { user: { id: 'user-1' } },
      errorResponse: null,
    });
    routeMocks.connectMongoose.mockResolvedValue(undefined);
    routeMocks.countDocuments.mockResolvedValue(1);

    const response = await GET(new Request('http://localhost/api/posts?page=2&limit=20'));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'invalid page' });
  });

  it('returns decrypted posts on valid GET with date filtering', async () => {
    routeMocks.requireApiSession.mockResolvedValue({
      session: { user: { id: 'user-1' } },
      errorResponse: null,
    });
    routeMocks.connectMongoose.mockResolvedValue(undefined);
    routeMocks.countDocuments.mockResolvedValue(1);
    routeMocks.find.mockReturnValue(
      makeQueryResult([
        {
          toObject: () => ({
            _id: 'post-1',
            authorId: 'user-1',
            createdAt: '2026-02-23T21:23:01.104Z',
            updatedAt: '2026-02-23T21:23:01.104Z',
            titleEnc: { alg: 'aes-256-gcm', iv: Buffer.from('iv1'), ct: Buffer.from('ct1'), tag: Buffer.from('tag1') },
            bodyEnc: { alg: 'aes-256-gcm', iv: Buffer.from('iv2'), ct: Buffer.from('ct2'), tag: Buffer.from('tag2') },
          }),
        },
      ]),
    );
    routeMocks.decrypt
      .mockResolvedValueOnce('Decrypted title')
      .mockResolvedValueOnce('Decrypted body');

    const response = await GET(
      new Request(
        'http://localhost/api/posts?page=1&limit=20&from=2026-02-23&to=2026-02-24',
      ),
    );
    const json = await response.json();

    expect(routeMocks.countDocuments).toHaveBeenCalledWith({
      authorId: 'user-1',
      createdAt: {
        $gte: '2026-02-23T00:00:00.000Z',
        $lte: '2026-02-24T23:59:59.999Z',
      },
    });
    expect(routeMocks.decrypt).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ alg: 'aes-256-gcm' }),
      'user-1',
    );
    expect(routeMocks.decrypt).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ alg: 'aes-256-gcm' }),
      'user-1',
    );
    expect(json).toEqual({
      posts: [
        {
          _id: 'post-1',
          authorId: 'user-1',
          createdAt: '2026-02-23T21:23:01.104Z',
          updatedAt: '2026-02-23T21:23:01.104Z',
          title: 'Decrypted title',
          body: 'Decrypted body',
        },
      ],
      page: 1,
      maxPage: 1,
      total: 1,
      limit: 20,
    });
  });
});
