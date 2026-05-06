import { beforeEach, describe, expect, it, vi } from 'vitest';

const routeMocks = vi.hoisted(() => ({
	requireApiSession: vi.fn(),
	connectMongoose: vi.fn(),
	encrypt: vi.fn(),
	decrypt: vi.fn(),
	create: vi.fn(),
	find: vi.fn(),
	readJsonWithLimit: vi.fn(),
	loggerError: vi.fn(),
	loggerWarn: vi.fn(),
}));

vi.mock('@/features/auth/server/require-api-session', () => ({
	requireApiSession: routeMocks.requireApiSession,
}));

vi.mock('@/shared/database/mongoose', () => ({
	connectMongoose: routeMocks.connectMongoose,
}));

vi.mock('@/shared/security/encryption/aes-256-gcm', () => ({
	encrypt: routeMocks.encrypt,
	decrypt: routeMocks.decrypt,
}));

vi.mock('@/features/tags/server/tag.model', () => ({
	Tags: {
		create: routeMocks.create,
		find: routeMocks.find,
	},
}));

vi.mock('@/shared/utils/json', () => ({
	readJsonWithLimit: routeMocks.readJsonWithLimit,
}));

vi.mock('@/shared/logging/logger', () => ({
	logger: {
		error: routeMocks.loggerError,
		warn: routeMocks.loggerWarn,
	},
}));

import { GET, POST, runtime } from '@/app/api/tags/route';

function jsonRequest(url: string, body: unknown) {
	return new Request(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
}

describe('tags route', () => {
	beforeEach(() => {
		routeMocks.requireApiSession.mockReset();
		routeMocks.connectMongoose.mockReset();
		routeMocks.encrypt.mockReset();
		routeMocks.decrypt.mockReset();
		routeMocks.create.mockReset();
		routeMocks.find.mockReset();
		routeMocks.readJsonWithLimit.mockReset();
		routeMocks.loggerError.mockReset();
		routeMocks.loggerWarn.mockReset();
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

		const response = await POST(
			jsonRequest('http://localhost/api/tags', {
				text: 'Work',
				color: '#ffcc00',
			}),
		);

		expect(response.status).toBe(401);
		expect(routeMocks.readJsonWithLimit).not.toHaveBeenCalled();
	});

	it('returns 400 and logs tag route metadata when readJsonWithLimit throws', async () => {
		routeMocks.requireApiSession.mockResolvedValue({
			session: { user: { id: 'user-1' } },
			errorResponse: null,
		});

		const readerError = new Error('Request body too large');
		routeMocks.readJsonWithLimit.mockRejectedValue(readerError);

		const request = jsonRequest('http://localhost/api/tags', {
			text: 'Work',
			color: '#ffcc00',
		});

		const response = await POST(request);

		expect(routeMocks.readJsonWithLimit).toHaveBeenCalledWith(request, 1024);
		expect(routeMocks.loggerWarn).toHaveBeenCalledWith('Rejected tag payload', {
			error: readerError,
			route: 'POST /api/tags',
			status: 400,
		});
		expect(routeMocks.encrypt).not.toHaveBeenCalled();
		expect(routeMocks.connectMongoose).not.toHaveBeenCalled();
		expect(routeMocks.create).not.toHaveBeenCalled();
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ message: 'Invalid JSON' });
	});

	it('rejects invalid POST payloads', async () => {
		routeMocks.requireApiSession.mockResolvedValue({
			session: { user: { id: 'user-1' } },
			errorResponse: null,
		});

		routeMocks.readJsonWithLimit
			.mockResolvedValueOnce({ text: '', color: '#ffcc00' })
			.mockResolvedValueOnce({ text: 'Work', color: 'yellow' });

		const badText = await POST(
			jsonRequest('http://localhost/api/tags', {
				text: '',
				color: '#ffcc00',
			}),
		);
		const badColor = await POST(
			jsonRequest('http://localhost/api/tags', {
				text: 'Work',
				color: 'yellow',
			}),
		);

		expect(badText.status).toBe(400);
		expect(await badText.json()).toEqual({ message: 'Invalid text' });

		expect(badColor.status).toBe(400);
		expect(await badColor.json()).toEqual({ message: 'Invalid color' });

		expect(routeMocks.encrypt).not.toHaveBeenCalled();
		expect(routeMocks.create).not.toHaveBeenCalled();
	});

	it('creates an encrypted tag on valid POST', async () => {
		routeMocks.requireApiSession.mockResolvedValue({
			session: { user: { id: 'user-1' } },
			errorResponse: null,
		});

		routeMocks.readJsonWithLimit.mockResolvedValue({
			text: 'Work',
			color: '#ffcc00',
		});

		routeMocks.encrypt.mockResolvedValue({
			alg: 'aes-256-gcm',
			iv: Buffer.from('iv1'),
			ct: Buffer.from('ct1'),
			tag: Buffer.from('tag1'),
		});

		routeMocks.create.mockResolvedValue({ _id: 'tag-1' });

		const request = jsonRequest('http://localhost/api/tags', {
			text: 'Work',
			color: '#ffcc00',
		});

		const response = await POST(request);

		expect(routeMocks.readJsonWithLimit).toHaveBeenCalledWith(request, 1024);
		expect(routeMocks.connectMongoose).toHaveBeenCalledTimes(1);
		expect(routeMocks.encrypt).toHaveBeenCalledWith('Work', 'user-1');
		expect(routeMocks.create).toHaveBeenCalledWith({
			textEnc: {
				v: 1,
				alg: 'aes-256-gcm',
				iv: Buffer.from('iv1'),
				ct: Buffer.from('ct1'),
				tag: Buffer.from('tag1'),
			},
			color: '#ffcc00',
			authorId: 'user-1',
		});

		expect(response.status).toBe(201);
		expect(await response.json()).toEqual({ _id: 'tag-1' });
	});

	it('returns 500 and logs when creating a tag fails', async () => {
		routeMocks.requireApiSession.mockResolvedValue({
			session: { user: { id: 'user-1' } },
			errorResponse: null,
		});

		routeMocks.readJsonWithLimit.mockResolvedValue({
			text: 'Work',
			color: '#ffcc00',
		});

		routeMocks.encrypt.mockResolvedValue({
			alg: 'aes-256-gcm',
			iv: Buffer.from('iv1'),
			ct: Buffer.from('ct1'),
			tag: Buffer.from('tag1'),
		});

		const createError = new Error('Mongo create failed');
		routeMocks.create.mockRejectedValue(createError);

		const response = await POST(
			jsonRequest('http://localhost/api/tags', {
				text: 'Work',
				color: '#ffcc00',
			}),
		);

		expect(routeMocks.loggerError).toHaveBeenCalledWith(
			'Failed to create tag',
			{
				authorId: 'user-1',
				error: createError,
				route: 'POST /api/tags',
				status: 500,
			},
		);
		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			message: 'Unable to create a tag',
		});
	});

	it('returns the auth error response when GET is unauthorized', async () => {
		routeMocks.requireApiSession.mockResolvedValue({
			session: null,
			errorResponse: new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			}),
		});

		const response = await GET(new Request('http://localhost/api/tags'));

		expect(response.status).toBe(401);
		expect(routeMocks.find).not.toHaveBeenCalled();
	});

	it('returns decrypted tags as an array on valid GET', async () => {
		routeMocks.requireApiSession.mockResolvedValue({
			session: { user: { id: 'user-1' } },
			errorResponse: null,
		});

		routeMocks.connectMongoose.mockResolvedValue(undefined);
		routeMocks.find.mockResolvedValue([
			{
				toObject: () => ({
					_id: 'tag-1',
					authorId: 'user-1',
					color: '#ffcc00',
					createdAt: '2026-05-06T08:00:00.000Z',
					updatedAt: '2026-05-06T08:00:00.000Z',
					textEnc: {
						alg: 'aes-256-gcm',
						iv: Buffer.from('iv1'),
						ct: Buffer.from('ct1'),
						tag: Buffer.from('tag1'),
					},
				}),
			},
		]);

		routeMocks.decrypt.mockResolvedValueOnce('Work');

		const response = await GET(new Request('http://localhost/api/tags'));
		const json = await response.json();

		expect(routeMocks.connectMongoose).toHaveBeenCalledTimes(1);
		expect(routeMocks.find).toHaveBeenCalledWith({ authorId: 'user-1' });
		expect(routeMocks.decrypt).toHaveBeenCalledWith(
			expect.objectContaining({ alg: 'aes-256-gcm' }),
			'user-1',
		);
		expect(Array.isArray(json)).toBe(true);
		expect(json).toEqual([
			{
				_id: 'tag-1',
				authorId: 'user-1',
				color: '#ffcc00',
				createdAt: '2026-05-06T08:00:00.000Z',
				updatedAt: '2026-05-06T08:00:00.000Z',
				text: 'Work',
			},
		]);
	});

	it('returns an empty tags list as an array', async () => {
		routeMocks.requireApiSession.mockResolvedValue({
			session: { user: { id: 'user-1' } },
			errorResponse: null,
		});

		routeMocks.connectMongoose.mockResolvedValue(undefined);
		routeMocks.find.mockResolvedValue([]);

		const response = await GET(new Request('http://localhost/api/tags'));
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json).toEqual([]);
		expect(Array.isArray(json)).toBe(true);
	});

	it('returns 500 and logs when listing tags fails', async () => {
		routeMocks.requireApiSession.mockResolvedValue({
			session: { user: { id: 'user-1' } },
			errorResponse: null,
		});

		const listError = new Error('Mongo find failed');
		routeMocks.connectMongoose.mockResolvedValue(undefined);
		routeMocks.find.mockRejectedValue(listError);

		const response = await GET(new Request('http://localhost/api/tags'));

		expect(routeMocks.loggerError).toHaveBeenCalledWith('Failed to get tags', {
			authorId: 'user-1',
			error: listError,
			route: 'GET /api/tags',
			status: 500,
		});
		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			message: 'Unable to get tags',
		});
	});
});
