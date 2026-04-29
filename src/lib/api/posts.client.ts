import { PostsResponse } from '@/types/posts.types';
import { DateValue } from '@mantine/dates';

export async function createPost(input: { title: string; body: string }) {
	const res = await fetch('/api/posts', {
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

	let url = `/api/posts?page=${page}&limit=${limit}`;

	if (params?.from && params?.to)
		url += `&from=${params?.from.toString()}&to=${params?.to.toString()}`;

	const res = await fetch(url, {
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
	const res = await fetch(`/api/posts/${_id}`, {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(requestBody),
	});

	if (!res.ok) throw new Error(await res.text());
	return res.json();
}
