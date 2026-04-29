import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

const postMocks = vi.hoisted(() => ({
	deletePost: vi.fn(),
	notify: vi.fn(),
	openConfirmModal: vi.fn(),
}));

vi.mock('@/lib/utils/format-date', () => ({
	formatPostDate: vi.fn(() => '21:23 23.02.2026'),
}));

vi.mock('@/lib/api/posts.client', () => ({
	createPost: vi.fn(),
	updatePost: vi.fn().mockResolvedValue({ _id: 'post-1' }),
	deletePost: postMocks.deletePost,
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: postMocks.notify,
	},
}));

vi.mock('@mantine/modals', () => ({
	openConfirmModal: postMocks.openConfirmModal,
}));

vi.mock('@/components/forms/PostForm', () => ({
	PostForm: ({
		onSuccess,
	}: {
		onSuccess: (values: { title: string; body: string }) => void;
	}) => (
		<button
			type="button"
			onClick={() => onSuccess({ title: 'New title', body: 'New body' })}
		>
			Save
		</button>
	),
}));

import { Post } from '@/components/containers/Post';

describe('Post', () => {
	beforeEach(() => {
		postMocks.deletePost.mockReset();
		postMocks.notify.mockReset();
		postMocks.openConfirmModal.mockReset();
	});

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
				onDeleted={vi.fn()}
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

		renderWithMantine(
			<Post
				_id="post-1"
				title="Old title"
				body="Old body"
				authorId="user-1"
				createdAt="2026-02-23T21:23:01.104Z"
				updatedAt="2026-02-23T21:23:01.104Z"
				onUpdated={onUpdated}
				onDeleted={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getAllByRole('button')[0]);
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

	it('opens a confirmation modal when delete is clicked', async () => {
		renderWithMantine(
			<Post
				_id="post-1"
				title="First post"
				body="Body"
				authorId="user-1"
				createdAt="2026-02-23T21:23:01.104Z"
				updatedAt="2026-02-23T21:23:01.104Z"
				onUpdated={vi.fn()}
				onDeleted={vi.fn()}
			/>,
		);

		const buttons = screen.getAllByRole('button');
		await userEvent.click(buttons[1]);

		expect(postMocks.openConfirmModal).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Delete post',
				labels: {
					confirm: 'Delete',
					cancel: 'Cancel',
				},
				confirmProps: {
					color: 'red',
				},
				onConfirm: expect.any(Function),
			}),
		);
	});

	it('deletes the post and reports the deleted id after confirmation', async () => {
		const onDeleted = vi.fn();
		postMocks.deletePost.mockResolvedValue({ _id: 'post-1' });

		renderWithMantine(
			<Post
				_id="post-1"
				title="First post"
				body="Body"
				authorId="user-1"
				createdAt="2026-02-23T21:23:01.104Z"
				updatedAt="2026-02-23T21:23:01.104Z"
				onUpdated={vi.fn()}
				onDeleted={onDeleted}
			/>,
		);

		const buttons = screen.getAllByRole('button');
		await userEvent.click(buttons[1]);

		const modalOptions = postMocks.openConfirmModal.mock.calls[0][0];
		await modalOptions.onConfirm();

		await waitFor(() => {
			expect(postMocks.deletePost).toHaveBeenCalledWith({ _id: 'post-1' });
		});
		expect(onDeleted).toHaveBeenCalledWith('post-1');
		expect(postMocks.notify).toHaveBeenCalledWith({
			color: 'green',
			title: 'Success',
			message: 'Post deleted Successfully',
		});
	});

	it('shows a failure notification when delete fails', async () => {
		const onDeleted = vi.fn();
		postMocks.deletePost.mockRejectedValue(new Error('fail'));

		renderWithMantine(
			<Post
				_id="post-1"
				title="First post"
				body="Body"
				authorId="user-1"
				createdAt="2026-02-23T21:23:01.104Z"
				updatedAt="2026-02-23T21:23:01.104Z"
				onUpdated={vi.fn()}
				onDeleted={onDeleted}
			/>,
		);

		const buttons = screen.getAllByRole('button');
		await userEvent.click(buttons[1]);

		const modalOptions = postMocks.openConfirmModal.mock.calls[0][0];
		await modalOptions.onConfirm();

		expect(onDeleted).not.toHaveBeenCalled();
		expect(postMocks.notify).toHaveBeenCalledWith({
			color: 'red',
			title: 'Failure',
			message: 'Failed to delete post',
		});
	});
});
