import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const postsListMocks = vi.hoisted(() => ({
	notify: vi.fn(),
	intersection: {
		isIntersecting: false,
	},
}));

const emptyDateRange: [null, null] = [null, null];

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: postsListMocks.notify,
	},
}));

vi.mock('@mantine/hooks', () => ({
	useIntersection: () => ({
		ref: vi.fn(),
		entry: { isIntersecting: postsListMocks.intersection.isIntersecting },
	}),
}));

vi.mock('@/lib/api/posts.client', () => ({
	getPosts: vi.fn(),
}));

vi.mock('@/components/containers/Post', () => ({
	Post: ({ title }: { title: string }) => <div>{title}</div>,
}));

import { getPosts } from '@/lib/api/posts.client';
import { PostsList } from '@/components/lists/PostsList';

describe('PostsList', () => {
	beforeEach(() => {
		postsListMocks.notify.mockReset();
		postsListMocks.intersection.isIntersecting = false;
		vi.mocked(getPosts).mockReset();
	});

	it('loads and renders the first page on mount', async () => {
		vi.mocked(getPosts).mockResolvedValue({
			posts: [
				{
					_id: 'post-1',
					title: 'First title',
					body: 'First body',
					authorId: 'user-1',
					createdAt: '2026-02-23T21:23:01.104Z',
					updatedAt: '2026-02-23T21:23:01.104Z',
				},
			],
			page: 1,
			maxPage: 1,
			total: 1,
			limit: 20,
		});

		renderWithMantine(<PostsList dateRange={emptyDateRange} />);

		await waitFor(() => {
			expect(getPosts).toHaveBeenCalledWith({
				page: 1,
				limit: 20,
				from: null,
				to: null,
			});
		});

		expect(screen.getByText('First title')).toBeInTheDocument();
	});

	it('loads the next page when the sentinel intersects and deduplicates posts', async () => {
		vi.mocked(getPosts)
			.mockResolvedValueOnce({
				posts: [
					{
						_id: 'post-1',
						title: 'First title',
						body: 'First body',
						authorId: 'user-1',
						createdAt: '2026-02-23T21:23:01.104Z',
						updatedAt: '2026-02-23T21:23:01.104Z',
					},
				],
				page: 1,
				maxPage: 2,
				total: 2,
				limit: 20,
			})
			.mockResolvedValueOnce({
				posts: [
					{
						_id: 'post-1',
						title: 'First title',
						body: 'First body',
						authorId: 'user-1',
						createdAt: '2026-02-23T21:23:01.104Z',
						updatedAt: '2026-02-23T21:23:01.104Z',
					},
					{
						_id: 'post-2',
						title: 'Second title',
						body: 'Second body',
						authorId: 'user-1',
						createdAt: '2026-02-24T21:23:01.104Z',
						updatedAt: '2026-02-24T21:23:01.104Z',
					},
				],
				page: 2,
				maxPage: 2,
				total: 2,
				limit: 20,
			});

		const { rerender } = renderWithMantine(
			<PostsList dateRange={emptyDateRange} />,
		);

		await waitFor(() => {
			expect(getPosts).toHaveBeenCalledTimes(1);
		});

		postsListMocks.intersection.isIntersecting = true;

		rerender(<PostsList dateRange={emptyDateRange} />);

		await waitFor(() => {
			expect(getPosts).toHaveBeenCalledTimes(2);
		});

		expect(screen.getAllByText('First title')).toHaveLength(1);
		expect(screen.getByText('Second title')).toBeInTheDocument();
	});

	it('shows a notification when loading fails', async () => {
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.mocked(getPosts).mockRejectedValue(new Error('fail'));

		renderWithMantine(<PostsList dateRange={emptyDateRange} />);

		await waitFor(() => {
			expect(postsListMocks.notify).toHaveBeenCalledWith({
				title: 'Error',
				message: 'Failed to fetch posts',
				color: 'red',
			});
		});

		consoleErrorSpy.mockRestore();
	});
});
