import { describe, expect, it } from 'vitest';
import { parsePostsPagination } from '@/features/posts/server/post-pagination';

describe('parsePostsPagination', () => {
	it('uses defaults when pagination params are absent', () => {
		const result = parsePostsPagination(new URLSearchParams());

		expect(result).toEqual({ page: 1, limit: 20 });
	});

	it('clamps page and limit to supported ranges', () => {
		const result = parsePostsPagination(
			new URLSearchParams({ page: '-5', limit: '500' }),
		);

		expect(result).toEqual({ page: 1, limit: 100 });
	});

	it('falls back for non-numeric input', () => {
		const result = parsePostsPagination(
			new URLSearchParams({ page: 'nope', limit: 'wat' }),
		);

		expect(result).toEqual({ page: 1, limit: 20 });
	});
});
