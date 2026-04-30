import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchJson } from '@/shared/http/fetch-json';

describe('fetchJson', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('returns parsed JSON for successful responses', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: true,
			json: async () => ({ ok: true }),
		} as Response);

		await expect(fetchJson('/api/example')).resolves.toEqual({ ok: true });
	});

	it('throws the response text for unsuccessful responses', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: false,
			text: async () => 'request failed',
		} as Response);

		await expect(fetchJson('/api/example')).rejects.toThrow('request failed');
	});
});
