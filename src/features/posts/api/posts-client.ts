import { PostContent, PostsResponse } from '@/features/posts/types';
import { DateValue } from '@mantine/dates';
import { fetchJson } from '@/shared/http/fetch-json';

const POSTS_ENDPOINT = '/api/posts';

/**
 * Creates a post through the authenticated browser session.
 */
export function createPost(input: PostContent) {
	return fetchJson<{ _id: string }>(POSTS_ENDPOINT, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});
}

/**
 * Loads one page of posts. Date filtering is sent only when both range ends are present.
 */
export function getPosts(params?: {
	page?: number;
	limit?: number;
	from?: DateValue;
	to?: DateValue;
}) {
	const page = params?.page ?? 1;
	const limit = params?.limit ?? 20;
	const searchParams = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	});

	// The API expects a complete range so partial filters do not hide results.
	if (params?.from && params?.to) {
		searchParams.set('from', params.from.toString());
		searchParams.set('to', params.to.toString());
	}

	return fetchJson<PostsResponse>(
		`${POSTS_ENDPOINT}?${searchParams.toString()}`,
		{
			method: 'GET',
			credentials: 'include',
		},
	);
}

/**
 * Updates a post owned by the current user.
 */
export function updatePost(input: PostContent & { _id: string }) {
	const { _id, ...requestBody } = input;
	return fetchJson<{ _id: string }>(`${POSTS_ENDPOINT}/${_id}`, {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(requestBody),
	});
}

/**
 * Deletes a post owned by the current user.
 */
export function deletePost(input: { _id: string }) {
	return fetchJson<{ _id: string }>(`${POSTS_ENDPOINT}/${input._id}`, {
		method: 'DELETE',
		credentials: 'include',
	});
}
