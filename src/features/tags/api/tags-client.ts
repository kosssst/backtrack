import { TagContent } from '@/features/tags/types';
import { fetchJson } from '@/shared/http/fetch-json';

const TAGS_ENDPOINT = '/api/tags';

/**
 * Creates new tag
 */
export function createTag(input: TagContent) {
	return fetchJson<{ _id: string }>(TAGS_ENDPOINT, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});
}
