import { TagContent } from '@/features/tags/types';
import { fetchJson } from '@/shared/http/fetch-json';

const TAGS_ENDPOINT = '/api/tags';

/**
 * Creates a tag through the authenticated browser session.
 */
export function createTag(input: TagContent) {
	return fetchJson<{ _id: string }>(TAGS_ENDPOINT, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});
}

/**
 * Updates a tag owned by the current user.
 */
export function updateTag(input: TagContent & { _id: string }) {
	const { _id, ...requestBody } = input;
	return fetchJson<{ _id: string }>(`${TAGS_ENDPOINT}/${_id}`, {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(requestBody),
	});
}
