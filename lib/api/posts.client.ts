import { PostsResponse } from '@/types/posts.types';

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

export async function getPosts(params?: { page?: number; limit?: number }) {
	const page = params?.page ?? 1;
	const limit = params?.limit ?? 20;

	const res = await fetch(`/api/posts?page=${page}&limit=${limit}`, {
		method: 'GET',
		credentials: 'include',
	});

	if (!res.ok) throw new Error(await res.text());
	return (await res.json()) as PostsResponse;
}
