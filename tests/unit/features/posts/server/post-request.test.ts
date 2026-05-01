import { describe, expect, it } from 'vitest';
import { readPostPayload } from '@/features/posts/server/post.service';
import {
	POST_BODY_MAX_LENGTH,
	POST_TITLE_MAX_LENGTH,
} from '@/features/posts/constants';

function jsonRequest(body: unknown) {
	return new Request('http://localhost/api/posts', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
}

describe('readPostPayload', () => {
	it('trims and returns a valid post payload', async () => {
		const result = await readPostPayload(
			jsonRequest({ title: '  Title  ', body: '  Body  ' }),
		);

		expect(result).toEqual({
			ok: true,
			value: { title: 'Title', body: 'Body' },
		});
	});

	it('accepts payload values at their configured length limits', async () => {
		const title = 'a'.repeat(POST_TITLE_MAX_LENGTH);
		const body = 'a'.repeat(POST_BODY_MAX_LENGTH);

		const result = await readPostPayload(jsonRequest({ title, body }));

		expect(result).toEqual({
			ok: true,
			value: { title, body },
		});
	});

	it('rejects invalid title and body values with client-safe messages', async () => {
		await expect(
			readPostPayload(jsonRequest({ title: '', body: 'Body' })),
		).resolves.toEqual({
			ok: false,
			message: 'Invalid title',
		});

		await expect(
			readPostPayload(jsonRequest({ title: 'Title', body: '' })),
		).resolves.toEqual({
			ok: false,
			message: 'Invalid content',
		});
	});

	it('rejects missing title and body fields with client-safe messages', async () => {
		await expect(
			readPostPayload(jsonRequest({ body: 'Body' })),
		).resolves.toEqual({
			ok: false,
			message: 'Invalid title',
		});

		await expect(
			readPostPayload(jsonRequest({ title: 'Title' })),
		).resolves.toEqual({
			ok: false,
			message: 'Invalid content',
		});
	});

	it('rejects title and body values above their length limits', async () => {
		await expect(
			readPostPayload(
				jsonRequest({
					title: 'a'.repeat(POST_TITLE_MAX_LENGTH + 1),
					body: 'Body',
				}),
			),
		).resolves.toEqual({
			ok: false,
			message: 'Invalid title',
		});

		await expect(
			readPostPayload(
				jsonRequest({
					title: 'Title',
					body: 'a'.repeat(POST_BODY_MAX_LENGTH + 1),
				}),
			),
		).resolves.toEqual({
			ok: false,
			message: 'Invalid content',
		});
	});

	it('keeps the low-level parser error as a cause for logging', async () => {
		const request = new Request('http://localhost/api/posts', {
			method: 'POST',
			headers: { 'Content-Type': 'text/plain' },
			body: 'not json',
		});

		const result = await readPostPayload(request);

		expect(result.ok).toBe(false);
		expect(result).toMatchObject({
			message: 'Invalid JSON',
			cause: expect.any(Error),
		});
	});
});
