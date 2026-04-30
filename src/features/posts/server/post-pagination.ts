import 'server-only';

import {
	POSTS_DEFAULT_PAGE,
	POSTS_DEFAULT_PAGE_LIMIT,
	POSTS_MAX_PAGE_LIMIT,
} from '@/features/posts/constants';

function toIntParam(value: string | null, fallback: number) {
	if (value == null || value.trim() === '') return fallback;

	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Parses list pagination query parameters and clamps them to API limits.
 */
export function parsePostsPagination(searchParams: URLSearchParams) {
	const limit = Math.min(
		Math.max(
			toIntParam(searchParams.get('limit'), POSTS_DEFAULT_PAGE_LIMIT),
			1,
		),
		POSTS_MAX_PAGE_LIMIT,
	);
	const page = Math.max(
		toIntParam(searchParams.get('page'), POSTS_DEFAULT_PAGE),
		POSTS_DEFAULT_PAGE,
	);

	return { page, limit };
}
