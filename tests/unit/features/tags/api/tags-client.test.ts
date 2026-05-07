import { createTag, updateTag } from '@/features/tags/api/tags-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('tags client', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('creates a tag with the expected fetch payload', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: true,
			json: async () => ({ _id: 'tag-1' }),
		} as Response);

		const result = await createTag({ text: 'Work', color: '#ef4444' });

		expect(fetchMock).toHaveBeenCalledWith('/api/tags', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text: 'Work', color: '#ef4444' }),
		});
		expect(result).toEqual({ _id: 'tag-1' });
	});

	it('updates a tag with the expected fetch payload', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: true,
			json: async () => ({ _id: 'tag-1' }),
		} as Response);

		const result = await updateTag({
			_id: 'tag-1',
			text: 'Updated tag',
			color: '#f97316',
		});

		expect(fetchMock).toHaveBeenCalledWith('/api/tags/tag-1', {
			method: 'PUT',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				text: 'Updated tag',
				color: '#f97316',
			}),
		});
		expect(result).toEqual({ _id: 'tag-1' });
	});
});
