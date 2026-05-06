import { beforeEach, describe, expect, it, vi } from 'vitest';

const routeMocks = vi.hoisted(() => ({
	requireApiSession: vi.fn(),
	connectMongoose: vi.fn(),
	readJsonWithLimit: vi.fn(),
	loggerError: vi.fn(),
	loggerWarn: vi.fn(),
	encrypt: vi.fn(),
	decrypt: vi.fn(),
	updateOne: vi.fn(),
	deleteOne: vi.fn(),
}));

vi.mock('@/features/auth/server/require-api-session', () => ({
	requireApiSession: routeMocks.requireApiSession,
}));

vi.mock('@/shared/database/mongoose', () => ({
	connectMongoose: routeMocks.connectMongoose,
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

vi.mock('@/shared/security/encryption/aes-256-gcm', () => ({
	encrypt: routeMocks.encrypt,
	decrypt: routeMocks.decrypt,
}));

vi.mock('@/features/tags/server/tag.model', () => ({
	Tags: {
		updateOne: routeMocks.updateOne,
		deleteOne: routeMocks.deleteOne,
	},
}));

import { DELETE, PUT, runtime } from '@/app/api/tags/[tagId]/route';

const VALID_TAG_ID = '507f1f77bcf86cd799439011';
const INVALID_TAG_ID = 'not-an-id';

function jsonRequest(url: string, body: unknown, method = 'PUT') {
	return new Request(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
}

function params(tagId = VALID_TAG_ID) {
	return {
		params: Promise.resolve({ tagId }),
	};
}

describe('tags/[tagId] route', () => {
	beforeEach(() => {
		routeMocks.requireApiSession.mockReset();
		routeMocks.connectMongoose.mockReset();
		routeMocks.readJsonWithLimit.mockReset();
		routeMocks.loggerError.mockReset();
		routeMocks.loggerWarn.mockReset();
		routeMocks.encrypt.mockReset();
		routeMocks.decrypt.mockReset();
		routeMocks.updateOne.mockReset();
		routeMocks.deleteOne.mockReset();
	});

	it('uses the node runtime', () => {
		expect(runtime).toBe('nodejs');
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
				jsonRequest('http://localhost/api/tags/unauthorized', {
					text: 'Work',
					color: '#ffcc00',
				}),
				params(),
			);

			expect(response.status).toBe(401);
			expect(routeMocks.readJsonWithLimit).not.toHaveBeenCalled();
			expect(routeMocks.encrypt).not.toHaveBeenCalled();
			expect(routeMocks.connectMongoose).not.toHaveBeenCalled();
			expect(routeMocks.updateOne).not.toHaveBeenCalled();
		});

		it('returns 400 and logs tag metadata when readJsonWithLimit throws', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			const readerError = new Error('Invalid JSON');
			routeMocks.readJsonWithLimit.mockRejectedValue(readerError);

			const request = jsonRequest(`http://localhost/api/tags/${VALID_TAG_ID}`, {
				text: 'Work',
				color: '#ffcc00',
			});

			const response = await PUT(request, params());

			expect(routeMocks.readJsonWithLimit).toHaveBeenCalledWith(request, 1024);
			expect(routeMocks.loggerWarn).toHaveBeenCalledWith(
				'Rejected tag payload',
				{
					error: readerError,
					route: `PUT /api/tags/${VALID_TAG_ID}`,
					status: 400,
				},
			);
			expect(routeMocks.encrypt).not.toHaveBeenCalled();
			expect(routeMocks.connectMongoose).not.toHaveBeenCalled();
			expect(routeMocks.updateOne).not.toHaveBeenCalled();
			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({ message: 'Invalid JSON' });
		});

		it('rejects invalid tag payloads', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			routeMocks.readJsonWithLimit
				.mockResolvedValueOnce({ text: '', color: '#ffcc00' })
				.mockResolvedValueOnce({ text: 'Work', color: 'yellow' });

			const badText = await PUT(
				jsonRequest(`http://localhost/api/tags/${VALID_TAG_ID}`, {
					text: '',
					color: '#ffcc00',
				}),
				params(),
			);
			const badColor = await PUT(
				jsonRequest(`http://localhost/api/tags/${VALID_TAG_ID}`, {
					text: 'Work',
					color: 'yellow',
				}),
				params(),
			);

			expect(badText.status).toBe(400);
			expect(await badText.json()).toEqual({ message: 'Invalid text' });

			expect(badColor.status).toBe(400);
			expect(await badColor.json()).toEqual({ message: 'Invalid color' });

			expect(routeMocks.encrypt).not.toHaveBeenCalled();
			expect(routeMocks.connectMongoose).not.toHaveBeenCalled();
			expect(routeMocks.updateOne).not.toHaveBeenCalled();
		});

		it('returns 404 and skips Mongo when the tag id is malformed', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			routeMocks.readJsonWithLimit.mockResolvedValue({
				text: 'Work',
				color: '#ffcc00',
			});

			const response = await PUT(
				jsonRequest('http://localhost/api/tags/not-an-id', {
					text: 'Work',
					color: '#ffcc00',
				}),
				params(INVALID_TAG_ID),
			);

			expect(response.status).toBe(404);
			expect(await response.json()).toEqual({ message: 'Tag not found' });
			expect(routeMocks.encrypt).not.toHaveBeenCalled();
			expect(routeMocks.connectMongoose).not.toHaveBeenCalled();
			expect(routeMocks.updateOne).not.toHaveBeenCalled();
			expect(routeMocks.loggerError).not.toHaveBeenCalled();
		});

		it('encrypts and updates the tag on valid PUT', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			routeMocks.readJsonWithLimit.mockResolvedValue({
				text: '  Work  ',
				color: '  #ffcc00  ',
			});

			routeMocks.encrypt.mockResolvedValue({
				alg: 'aes-256-gcm',
				iv: Buffer.from('iv1'),
				ct: Buffer.from('ct1'),
				tag: Buffer.from('tag1'),
			});

			routeMocks.connectMongoose.mockResolvedValue(undefined);
			routeMocks.updateOne.mockResolvedValue({ modifiedCount: 1 });

			const request = jsonRequest(`http://localhost/api/tags/${VALID_TAG_ID}`, {
				text: '  Work  ',
				color: '  #ffcc00  ',
			});

			const response = await PUT(request, params());

			expect(routeMocks.readJsonWithLimit).toHaveBeenCalledWith(request, 1024);
			expect(routeMocks.encrypt).toHaveBeenCalledWith('Work', 'user-1');
			expect(routeMocks.connectMongoose).toHaveBeenCalledTimes(1);
			expect(routeMocks.updateOne).toHaveBeenCalledWith(
				{ _id: VALID_TAG_ID, authorId: 'user-1' },
				{
					textEnc: {
						v: 1,
						alg: 'aes-256-gcm',
						iv: Buffer.from('iv1'),
						ct: Buffer.from('ct1'),
						tag: Buffer.from('tag1'),
					},
					color: '#ffcc00',
				},
			);
			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ _id: VALID_TAG_ID });
		});

		it('returns 404 when the tag to update is not found', async () => {
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

			routeMocks.connectMongoose.mockResolvedValue(undefined);
			routeMocks.updateOne.mockResolvedValue({
				matchedCount: 0,
				modifiedCount: 0,
			});

			const response = await PUT(
				jsonRequest(`http://localhost/api/tags/${VALID_TAG_ID}`, {
					text: 'Work',
					color: '#ffcc00',
				}),
				params(),
			);

			expect(response.status).toBe(404);
			expect(await response.json()).toEqual({ message: 'Tag not found' });
		});

		it('returns 500 and logs when updateOne throws', async () => {
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

			const updateError = new Error('Mongo update failed');
			routeMocks.connectMongoose.mockResolvedValue(undefined);
			routeMocks.updateOne.mockRejectedValue(updateError);

			const response = await PUT(
				jsonRequest(`http://localhost/api/tags/${VALID_TAG_ID}`, {
					text: 'Work',
					color: '#ffcc00',
				}),
				params(),
			);

			expect(routeMocks.connectMongoose).toHaveBeenCalledTimes(1);
			expect(routeMocks.updateOne).toHaveBeenCalledTimes(1);
			expect(routeMocks.loggerError).toHaveBeenCalledWith(
				'Failed to update tag',
				{
					authorId: 'user-1',
					error: updateError,
					route: `PUT /api/tags/${VALID_TAG_ID}`,
					status: 500,
				},
			);
			expect(response.status).toBe(500);
			expect(await response.json()).toEqual({
				message: 'Unable to update the tag',
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
				new Request(`http://localhost/api/tags/${VALID_TAG_ID}`, {
					method: 'DELETE',
				}),
				params(),
			);

			expect(response.status).toBe(401);
			expect(routeMocks.connectMongoose).not.toHaveBeenCalled();
			expect(routeMocks.deleteOne).not.toHaveBeenCalled();
		});

		it('returns 404 and skips Mongo when the tag id is malformed', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			const response = await DELETE(
				new Request('http://localhost/api/tags/not-an-id', {
					method: 'DELETE',
				}),
				params(INVALID_TAG_ID),
			);

			expect(response.status).toBe(404);
			expect(await response.json()).toEqual({ message: 'Tag not found' });
			expect(routeMocks.connectMongoose).not.toHaveBeenCalled();
			expect(routeMocks.deleteOne).not.toHaveBeenCalled();
			expect(routeMocks.loggerError).not.toHaveBeenCalled();
		});

		it('deletes the tag on valid DELETE', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			routeMocks.connectMongoose.mockResolvedValue(undefined);
			routeMocks.deleteOne.mockResolvedValue({ deletedCount: 1 });

			const response = await DELETE(
				new Request(`http://localhost/api/tags/${VALID_TAG_ID}`, {
					method: 'DELETE',
				}),
				params(),
			);

			expect(routeMocks.connectMongoose).toHaveBeenCalledTimes(1);
			expect(routeMocks.deleteOne).toHaveBeenCalledWith({
				_id: VALID_TAG_ID,
				authorId: 'user-1',
			});
			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ _id: VALID_TAG_ID });
		});

		it('returns 404 when the tag to delete is not found', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			routeMocks.connectMongoose.mockResolvedValue(undefined);
			routeMocks.deleteOne.mockResolvedValue({ deletedCount: 0 });

			const response = await DELETE(
				new Request(`http://localhost/api/tags/${VALID_TAG_ID}`, {
					method: 'DELETE',
				}),
				params(),
			);

			expect(response.status).toBe(404);
			expect(await response.json()).toEqual({ message: 'Tag not found' });
		});

		it('returns 500 and logs when deleteOne throws', async () => {
			routeMocks.requireApiSession.mockResolvedValue({
				session: { user: { id: 'user-1' } },
				errorResponse: null,
			});

			const deleteError = new Error('Mongo delete failed');
			routeMocks.connectMongoose.mockResolvedValue(undefined);
			routeMocks.deleteOne.mockRejectedValue(deleteError);

			const response = await DELETE(
				new Request(`http://localhost/api/tags/${VALID_TAG_ID}`, {
					method: 'DELETE',
				}),
				params(),
			);

			expect(routeMocks.connectMongoose).toHaveBeenCalledTimes(1);
			expect(routeMocks.deleteOne).toHaveBeenCalledWith({
				_id: VALID_TAG_ID,
				authorId: 'user-1',
			});
			expect(routeMocks.loggerError).toHaveBeenCalledWith(
				'Failed to delete tag',
				{
					authorId: 'user-1',
					error: deleteError,
					route: `DELETE /api/tags/${VALID_TAG_ID}`,
					status: 500,
				},
			);
			expect(response.status).toBe(500);
			expect(await response.json()).toEqual({
				message: 'Unable to delete tag',
			});
		});
	});
});
