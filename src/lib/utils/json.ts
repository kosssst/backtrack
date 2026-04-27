export async function readJsonWithLimit<T>(
	req: Request,
	maxBytes: number,
): Promise<T> {
	if (!Number.isInteger(maxBytes) || maxBytes <= 0) {
		throw new Error('maxBytes must be a positive integer');
	}

	const contentType = req.headers.get('content-type') ?? '';
	if (!contentType.toLowerCase().includes('application/json')) {
		throw new Error('Content-Type must include "application/json"');
	}

	const contentLength = req.headers.get('content-length');
	if (contentLength !== null) {
		const parsedLength = Number(contentLength);

		if (!Number.isFinite(parsedLength) || parsedLength < 0) {
			throw new Error('Invalid Content-Length');
		}

		if (parsedLength > maxBytes) {
			throw new Error('Request body too large');
		}
	}

	if (!req.body) {
		throw new Error('Empty request body');
	}

	const reader = req.body.getReader();
	const chunks: Uint8Array[] = [];
	let totalBytes = 0;

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (!value) continue;

			totalBytes += value.byteLength;

			if (totalBytes > maxBytes) {
				await reader.cancel('body too large');
				throw new Error('Request body too large');
			}

			chunks.push(value);
		}
	} catch (error) {
		throw error;
	}

	try {
		const merged = new Uint8Array(totalBytes);
		let offset = 0;

		for (const chunk of chunks) {
			merged.set(chunk, offset);
			offset += chunk.byteLength;
		}

		const text = new TextDecoder().decode(merged);
		return JSON.parse(text) as T;
	} catch {
		throw new Error('Invalid JSON');
	}
}
