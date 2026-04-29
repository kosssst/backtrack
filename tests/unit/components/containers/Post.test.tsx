import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

vi.mock('@/lib/utils/format-date', () => ({
	formatPostDate: vi.fn(() => '21:23 23.02.2026'),
}));

import { Post } from '@/components/containers/Post';

describe('Post', () => {
	it('renders title, body and formatted creation date', () => {
		renderWithMantine(
			<Post
				_id="post-1"
				title="First post"
				body={'Hello\nworld'}
				authorId="user-1"
				createdAt="2026-02-23T21:23:01.104Z"
				updatedAt="2026-02-23T21:23:01.104Z"
				onUpdated={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole('heading', { name: 'First post' }),
		).toBeInTheDocument();
		expect(screen.getByText(/Hello\s*world/)).toBeInTheDocument();
		expect(screen.getByText('21:23 23.02.2026')).toBeInTheDocument();
	});

	it('switches to edit form and reports updated post values', async () => {
		const onUpdated = vi.fn();

		vi.mock('@/lib/api/posts.client', () => ({
			updatePost: vi.fn().mockResolvedValue({ _id: 'post-1' }),
			createPost: vi.fn(),
		}));

		renderWithMantine(
			<Post
				_id="post-1"
				title="Old title"
				body="Old body"
				authorId="user-1"
				createdAt="2026-02-23T21:23:01.104Z"
				updatedAt="2026-02-23T21:23:01.104Z"
				onUpdated={onUpdated}
			/>,
		);

		await userEvent.click(screen.getByRole('button'));

		await userEvent.clear(screen.getByRole('textbox', { name: /title/i }));
		await userEvent.type(screen.getByRole('textbox', { name: /title/i }), 'New title');
		await userEvent.clear(screen.getByRole('textbox', { name: /body/i }));
		await userEvent.type(screen.getByRole('textbox', { name: /body/i }), 'New body');

		await userEvent.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor(() => {
			expect(onUpdated).toHaveBeenCalledWith({
				_id: 'post-1',
				title: 'New title',
				body: 'New body',
				authorId: 'user-1',
				createdAt: '2026-02-23T21:23:01.104Z',
				updatedAt: expect.any(String),
			});
		});
	});
});
