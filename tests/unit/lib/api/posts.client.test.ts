import {
	createPost,
	deletePost,
	getPosts,
	updatePost,
} from '@/lib/api/posts.client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('posts client', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('creates a post with the expected fetch payload', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: true,
			json: async () => ({ _id: 'post-1' }),
		} as Response);

		const result = await createPost({ title: 'Hello', body: 'World' });

		expect(fetchMock).toHaveBeenCalledWith('/api/posts', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title: 'Hello', body: 'World' }),
		});
		expect(result).toEqual({ _id: 'post-1' });
	});

	it('throws the server response text when createPost fails', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: false,
			text: async () => 'boom',
		} as Response);

		await expect(createPost({ title: 'Hello', body: 'World' })).rejects.toThrow(
			'boom',
		);
	});

	it('fetches posts with default pagination values', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: true,
			json: async () => ({
				posts: [],
				page: 1,
				maxPage: 1,
				total: 0,
				limit: 20,
			}),
		} as Response);

		await getPosts();

		expect(fetchMock).toHaveBeenCalledWith('/api/posts?page=1&limit=20', {
			method: 'GET',
			credentials: 'include',
		});
	});

	it('adds from and to parameters when both are provided', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: true,
			json: async () => ({
				posts: [],
				page: 2,
				maxPage: 3,
				total: 40,
				limit: 10,
			}),
		} as Response);

		await getPosts({
			page: 2,
			limit: 10,
			from: { toString: () => '2026-03-01' } as never,
			to: { toString: () => '2026-03-05' } as never,
		});

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/posts?page=2&limit=10&from=2026-03-01&to=2026-03-05',
			{
				method: 'GET',
				credentials: 'include',
			},
		);
	});

	it('throws the server response text when getPosts fails', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: false,
			text: async () => 'cannot load posts',
		} as Response);

		await expect(getPosts()).rejects.toThrow('cannot load posts');
	});

	it('updates a post with the expected fetch payload', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: true,
			json: async () => ({ _id: 'post-1' }),
		} as Response);

		const result = await updatePost({
			_id: 'post-1',
			title: 'Updated title',
			body: 'Updated body',
		});

		expect(fetchMock).toHaveBeenCalledWith('/api/posts/post-1', {
			method: 'PUT',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title: 'Updated title',
				body: 'Updated body',
			}),
		});

		expect(result).toEqual({ _id: 'post-1' });
	});

	it('deletes a post with the expected fetch payload', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: true,
			json: async () => ({ _id: 'post-1' }),
		} as Response);

		const result = await deletePost({ _id: 'post-1' });

		expect(fetchMock).toHaveBeenCalledWith('/api/posts/post-1', {
			method: 'DELETE',
			credentials: 'include',
		});
		expect(result).toEqual({ _id: 'post-1' });
	});

	it('throws the server response text when deletePost fails', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: false,
			text: async () => 'cannot delete post',
		} as Response);

		await expect(deletePost({ _id: 'post-1' })).rejects.toThrow(
			'cannot delete post',
		);
	});
});
