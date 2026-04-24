import { describe, expect, it } from 'vitest';
import { readJsonWithLimit } from '@/lib/utils/json';

function streamFromText(text: string) {
	const chunk = new TextEncoder().encode(text);

	return new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(chunk);
			controller.close();
		},
	});
}

function makeRequest({
											 contentType = 'application/json',
											 contentLength,
											 text,
										 }: {
	contentType?: string;
	contentLength?: string;
	text?: string;
}) {
	const headers = new Headers();

	if (contentType) {
		headers.set('Content-Type', contentType);
	}

	if (contentLength !== undefined) {
		headers.set('Content-Length', contentLength);
	}

	return {
		headers,
		body: text === undefined ? null : streamFromText(text),
	} as unknown as Request;
}

async function expectReadJsonWithLimitToThrow(
	request: Request,
	maxBytes: number,
	expectedMessage: string,
) {
	try {
		await readJsonWithLimit(request, maxBytes);
		throw new Error('Expected readJsonWithLimit to throw');
	} catch (error) {
		expect(error).toBeInstanceOf(Error);
		expect((error as Error).message).toBe(expectedMessage);
	}
}

describe('readJsonWithLimit', () => {
	it('parses valid JSON when the body is within the limit', async () => {
		const request = makeRequest({
			contentType: 'application/json; charset=utf-8',
			text: JSON.stringify({ title: 'Hello', body: 'World' }),
		});

		const result = await readJsonWithLimit<{ title: string; body: string }>(
			request,
			1024,
		);

		expect(result).toEqual({
			title: 'Hello',
			body: 'World',
		});
	});

	it('throws when maxBytes is not a positive integer', async () => {
		const request = makeRequest({
			text: JSON.stringify({ ok: true }),
		});

		await expectReadJsonWithLimitToThrow(
			request,
			0,
			'maxBytes must be a positive integer',
		);
	});

	it('throws when content type is not application/json', async () => {
		const request = makeRequest({
			contentType: 'text/plain',
			text: '{"ok":true}',
		});

		await expectReadJsonWithLimitToThrow(
			request,
			1024,
			'Content-Type must include "application/json"',
		);
	});

	it('throws when Content-Length is invalid', async () => {
		const request = makeRequest({
			contentLength: 'not-a-number',
			text: '{"ok":true}',
		});

		await expectReadJsonWithLimitToThrow(
			request,
			1024,
			'Invalid Content-Length',
		);
	});

	it('throws when Content-Length exceeds the limit', async () => {
		const request = makeRequest({
			contentLength: '5000',
			text: '{"ok":true}',
		});

		await expectReadJsonWithLimitToThrow(
			request,
			1024,
			'Request body too large',
		);
	});

	it('throws when the body is empty', async () => {
		const request = makeRequest({
			contentType: 'application/json',
		});

		await expectReadJsonWithLimitToThrow(
			request,
			1024,
			'Empty request body',
		);
	});

	it('throws when the streamed body exceeds the limit even without Content-Length', async () => {
		const request = makeRequest({
			text: JSON.stringify({
				body: 'a'.repeat(200),
			}),
		});

		await expectReadJsonWithLimitToThrow(
			request,
			32,
			'Request body too large',
		);
	});

	it('throws when JSON is invalid', async () => {
		const request = makeRequest({
			text: '{"title":',
		});

		await expectReadJsonWithLimitToThrow(
			request,
			1024,
			'Invalid JSON',
		);
	});
});
