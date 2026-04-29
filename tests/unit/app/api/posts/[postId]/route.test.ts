import { beforeEach, describe, expect, it, vi } from 'vitest';

const routeMocks = vi.hoisted(() => ({
	requireApiSession: vi.fn(),
	connectMongoose: vi.fn(),
	readJsonWithLimit: vi.fn(),
	loggerError: vi.fn(),
	encrypt: vi.fn(),
	updateOne: vi.fn(),
	deleteOne: vi.fn(),
}));

vi.mock('@/lib/auth/require-api-session', () => ({
	requireApiSession: routeMocks.requireApiSession,
}));

vi.mock('@/lib/db/mongoose', () => ({
	connectMongoose: routeMocks.connectMongoose,
}));

vi.mock('@/lib/utils/json', () => ({
	readJsonWithLimit: routeMocks.readJsonWithLimit,
}));

vi.mock('@/lib/logger', () => ({
	logger: {
		error: routeMocks.loggerError,
	},
}));

vi.mock('@/lib/encryption/aes-265-gcm', () => ({
	encrypt: routeMocks.encrypt,
}));

vi.mock('@/models/posts.model', () => ({
	Posts: {
		updateOne: routeMocks.updateOne,
		deleteOne: routeMocks.deleteOne,
	},
}));

import { DELETE, PUT } from '@/app/api/posts/[postId]/route';

function jsonRequest(url: string, body: unknown, method = 'PUT') {
	return new Request(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
}

function params(postId = 'post-1') {
	return {
		params: Promise.resolve({ postId }),
	};
}

describe('posts/[postId] route', () => {
	beforeEach(() => {
		routeMocks.requireApiSession.mockReset();
		routeMocks.connectMongoose.mockReset();
		routeMocks.readJsonWithLimit.mockReset();
		routeMocks.loggerError.mockReset();
		routeMocks.encrypt.mockReset();
		routeMocks.updateOne.mockReset();
		routeMocks.deleteOne.mockReset();
	});

	describe('PUT', () => {
		it('returns the auth error response when PUT is unauthorized', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: null,
				errorResponse: new Response(JSON.stringify({ error: 'Unauthorized' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				}),
			});

			const response = await PUT(
				jsonRequest('http://localhost/api/posts/post-1', {
					title: 'Updated title',
					body: 'Updated body',
				}),
				params(),
			);

			expect(response.status).toBe(401);
			expect(routeMocks.readJsonWithLimit).not.toHaveBeenCalled();
			expect(routeMocks.encrypt).not.toHaveBeenCalled();
			expect(routeMocks.connectMongoose).not.toHaveBeenCalled();
			expect(routeMocks.updateOne).not.toHaveBeenCalled();
		});

		it('returns 400 and logs when readJsonWithLimit throws', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			const readerError = new Error('Invalid JSON');
			routeMocks.readJsonWithLimit.mockRejectedValue(readerError);

			const request = jsonRequest('http://localhost/api/posts/post-1', {
				title: 'Updated title',
				body: 'Updated body',
			});

			const response = await PUT(request, params());

			expect(routeMocks.readJsonWithLimit).toHaveBeenCalledWith(
				request,
				32 * 1024,
			);
			expect(routeMocks.loggerError).toHaveBeenCalledWith(readerError);
			expect(routeMocks.encrypt).not.toHaveBeenCalled();
			expect(routeMocks.connectMongoose).not.toHaveBeenCalled();
			expect(routeMocks.updateOne).not.toHaveBeenCalled();
			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({ message: 'Invalid JSON' });
		});

		it('rejects an invalid title', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			routeMocks.readJsonWithLimit.mockResolvedValue({
				title: '',
				body: 'Updated body',
			});

			const response = await PUT(
				jsonRequest('http://localhost/api/posts/post-1', {
					title: '',
					body: 'Updated body',
				}),
				params(),
			);

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({ message: 'Invalid title' });
			expect(routeMocks.encrypt).not.toHaveBeenCalled();
			expect(routeMocks.connectMongoose).not.toHaveBeenCalled();
			expect(routeMocks.updateOne).not.toHaveBeenCalled();
		});

		it('rejects a title longer than 200 characters', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			routeMocks.readJsonWithLimit.mockResolvedValue({
				title: 'a'.repeat(201),
				body: 'Updated body',
			});

			const response = await PUT(
				jsonRequest('http://localhost/api/posts/post-1', {
					title: 'a'.repeat(201),
					body: 'Updated body',
				}),
				params(),
			);

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({ message: 'Invalid title' });
			expect(routeMocks.encrypt).not.toHaveBeenCalled();
			expect(routeMocks.updateOne).not.toHaveBeenCalled();
		});

		it('rejects an invalid body', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			routeMocks.readJsonWithLimit.mockResolvedValue({
				title: 'Updated title',
				body: '',
			});

			const response = await PUT(
				jsonRequest('http://localhost/api/posts/post-1', {
					title: 'Updated title',
					body: '',
				}),
				params(),
			);

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({ message: 'Invalid content' });
			expect(routeMocks.encrypt).not.toHaveBeenCalled();
			expect(routeMocks.connectMongoose).not.toHaveBeenCalled();
			expect(routeMocks.updateOne).not.toHaveBeenCalled();
		});

		it('rejects a body longer than 20000 characters', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			routeMocks.readJsonWithLimit.mockResolvedValue({
				title: 'Updated title',
				body: 'a'.repeat(20_001),
			});

			const response = await PUT(
				jsonRequest('http://localhost/api/posts/post-1', {
					title: 'Updated title',
					body: 'a'.repeat(20_001),
				}),
				params(),
			);

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({ message: 'Invalid content' });
			expect(routeMocks.encrypt).not.toHaveBeenCalled();
			expect(routeMocks.updateOne).not.toHaveBeenCalled();
		});

		it('encrypts and updates the post on valid PUT', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			routeMocks.readJsonWithLimit.mockResolvedValue({
				title: '  Updated title  ',
				body: '  Updated body  ',
			});

			routeMocks.encrypt
				.mockResolvedValueOnce({
					alg: 'aes-256-gcm',
					iv: Buffer.from('iv1'),
					ct: Buffer.from('ct1'),
					tag: Buffer.from('tag1'),
				})
				.mockResolvedValueOnce({
					alg: 'aes-256-gcm',
					iv: Buffer.from('iv2'),
					ct: Buffer.from('ct2'),
					tag: Buffer.from('tag2'),
				});

			routeMocks.connectMongoose.mockResolvedValue(undefined);
			routeMocks.updateOne.mockResolvedValue({ modifiedCount: 1 });

			const request = jsonRequest('http://localhost/api/posts/post-1', {
				title: '  Updated title  ',
				body: '  Updated body  ',
			});

			const response = await PUT(request, params('post-1'));

			expect(routeMocks.readJsonWithLimit).toHaveBeenCalledWith(
				request,
				32 * 1024,
			);
			expect(routeMocks.encrypt).toHaveBeenNthCalledWith(
				1,
				'Updated title',
				'user-1',
			);
			expect(routeMocks.encrypt).toHaveBeenNthCalledWith(
				2,
				'Updated body',
				'user-1',
			);
			expect(routeMocks.connectMongoose).toHaveBeenCalledTimes(1);
			expect(routeMocks.updateOne).toHaveBeenCalledWith(
				{ _id: 'post-1' },
				{
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
				},
			);
			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ _id: 'post-1' });
		});

		it('returns 500 and logs when updateOne throws', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			routeMocks.readJsonWithLimit.mockResolvedValue({
				title: 'Updated title',
				body: 'Updated body',
			});

			routeMocks.encrypt
				.mockResolvedValueOnce({
					alg: 'aes-256-gcm',
					iv: Buffer.from('iv1'),
					ct: Buffer.from('ct1'),
					tag: Buffer.from('tag1'),
				})
				.mockResolvedValueOnce({
					alg: 'aes-256-gcm',
					iv: Buffer.from('iv2'),
					ct: Buffer.from('ct2'),
					tag: Buffer.from('tag2'),
				});

			const updateError = new Error('Mongo update failed');
			routeMocks.updateOne.mockRejectedValue(updateError);

			const response = await PUT(
				jsonRequest('http://localhost/api/posts/post-1', {
					title: 'Updated title',
					body: 'Updated body',
				}),
				params(),
			);

			expect(routeMocks.connectMongoose).toHaveBeenCalledTimes(1);
			expect(routeMocks.updateOne).toHaveBeenCalledTimes(1);
			expect(routeMocks.loggerError).toHaveBeenCalledWith(updateError);
			expect(response.status).toBe(500);
			expect(await response.json()).toEqual({
				message: 'Unable to update the post',
			});
		});
	});

	describe('DELETE', () => {
		it('returns the auth error response when DELETE is unauthorized', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: null,
				errorResponse: new Response(JSON.stringify({ error: 'Unauthorized' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				}),
			});

			const response = await DELETE(
				new Request('http://localhost/api/posts/post-1', {
					method: 'DELETE',
				}),
				params(),
			);

			expect(response.status).toBe(401);
			expect(routeMocks.connectMongoose).not.toHaveBeenCalled();
			expect(routeMocks.deleteOne).not.toHaveBeenCalled();
		});

		it('deletes the post on valid DELETE', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			routeMocks.connectMongoose.mockResolvedValue(undefined);
			routeMocks.deleteOne.mockResolvedValue({ deletedCount: 1 });

			const response = await DELETE(
				new Request('http://localhost/api/posts/post-1', {
					method: 'DELETE',
				}),
				params('post-1'),
			);

			expect(routeMocks.connectMongoose).toHaveBeenCalledTimes(1);
			expect(routeMocks.deleteOne).toHaveBeenCalledWith({ _id: 'post-1' });
			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ _id: 'post-1' });
		});

		it('returns 500 and logs when deleteOne throws', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			const deleteError = new Error('Mongo delete failed');
			routeMocks.deleteOne.mockRejectedValue(deleteError);

			const response = await DELETE(
				new Request('http://localhost/api/posts/post-1', {
					method: 'DELETE',
				}),
				params('post-1'),
			);

			expect(routeMocks.connectMongoose).toHaveBeenCalledTimes(1);
			expect(routeMocks.deleteOne).toHaveBeenCalledWith({ _id: 'post-1' });
			expect(routeMocks.loggerError).toHaveBeenCalledWith(deleteError);
			expect(response.status).toBe(500);
			expect(await response.json()).toEqual({
				message: 'Unable to delete post',
			});
		});
	});
});
