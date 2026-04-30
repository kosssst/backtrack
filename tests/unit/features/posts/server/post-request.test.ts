import { describe, expect, it } from 'vitest';
import { readPostPayload } from '@/features/posts/server/post-request';

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
