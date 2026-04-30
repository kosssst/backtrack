import { PostsResponse } from '@/features/posts/types';
import { DateValue } from '@mantine/dates';

const POSTS_ENDPOINT = '/api/posts';

export async function createPost(input: { title: string; body: string }) {
	const res = await fetch(POSTS_ENDPOINT, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});

	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

export async function getPosts(params?: {
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

	const res = await fetch(`${POSTS_ENDPOINT}?${searchParams.toString()}`, {
		method: 'GET',
		credentials: 'include',
	});

	if (!res.ok) throw new Error(await res.text());
	return (await res.json()) as PostsResponse;
}

export async function updatePost(input: {
	_id: string;
	title: string;
	body: string;
}) {
	const { _id, ...requestBody } = input;
	const res = await fetch(`${POSTS_ENDPOINT}/${_id}`, {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(requestBody),
	});

	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

export async function deletePost(input: { _id: string }) {
	const res = await fetch(`${POSTS_ENDPOINT}/${input._id}`, {
		method: 'DELETE',
		credentials: 'include',
	});

	if (!res.ok) throw new Error(await res.text());
	return res.json();
}
