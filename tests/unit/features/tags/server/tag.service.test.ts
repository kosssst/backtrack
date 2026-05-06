import { describe, expect, it } from 'vitest';
import { TAG_TEXT_MAX_LENGTH } from '@/features/tags/constants';
import { readTagPayload } from '@/features/tags/server/tag.service';

function jsonRequest(body: unknown) {
	return new Request('http://localhost/api/tags', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
}

describe('readTagPayload', () => {
	it('trims and returns a valid tag payload', async () => {
		const result = await readTagPayload(
			jsonRequest({ text: '  Work  ', color: '  #ffcc00  ' }),
		);

		expect(result).toEqual({
			ok: true,
			value: { text: 'Work', color: '#ffcc00' },
		});
	});

	it('accepts text at the configured length limit', async () => {
		const text = 'a'.repeat(TAG_TEXT_MAX_LENGTH);

		const result = await readTagPayload(
			jsonRequest({ text, color: '#123abc' }),
		);

		expect(result).toEqual({
			ok: true,
			value: { text, color: '#123abc' },
		});
	});

	it('rejects missing and overlong text with a tag-specific message', async () => {
		await expect(
			readTagPayload(jsonRequest({ color: '#123abc' })),
		).resolves.toEqual({
			ok: false,
			message: 'Invalid text',
		});

		await expect(
			readTagPayload(
				jsonRequest({
					text: 'a'.repeat(TAG_TEXT_MAX_LENGTH + 1),
					color: '#123abc',
				}),
			),
		).resolves.toEqual({
			ok: false,
			message: 'Invalid text',
		});
	});

	it('rejects missing and malformed colors', async () => {
		await expect(
			readTagPayload(jsonRequest({ text: 'Work' })),
		).resolves.toEqual({
			ok: false,
			message: 'Invalid color',
		});

		await expect(
			readTagPayload(jsonRequest({ text: 'Work', color: 'blue' })),
		).resolves.toEqual({
			ok: false,
			message: 'Invalid color',
		});
	});

	it('keeps the low-level parser error as a cause for logging', async () => {
		const request = new Request('http://localhost/api/tags', {
			method: 'POST',
			headers: { 'Content-Type': 'text/plain' },
			body: 'not json',
		});

		const result = await readTagPayload(request);

		expect(result.ok).toBe(false);
		expect(result).toMatchObject({
			message: 'Invalid JSON',
			cause: expect.any(Error),
		});
	});
});
