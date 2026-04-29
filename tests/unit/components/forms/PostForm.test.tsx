import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api/posts.client', () => ({
	createPost: vi.fn(),
	updatePost: vi.fn(),
}));

import { createPost, updatePost } from '@/lib/api/posts.client';
import { PostForm } from '@/components/forms/PostForm';

describe('PostForm', () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.mocked(createPost).mockReset();
		vi.mocked(updatePost).mockReset();
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	it('creates a post and passes submitted values to onSuccess', async () => {
		const onSuccess = vi.fn();
		const onCancel = vi.fn();
		const onFailure = vi.fn();

		vi.mocked(createPost).mockResolvedValue({ _id: 'post-1' } as never);

		renderWithMantine(
			<PostForm
				onSuccess={onSuccess}
				onCancel={onCancel}
				onFailure={onFailure}
			/>,
		);

		await userEvent.type(
			screen.getByRole('textbox', { name: /title/i }),
			'My title',
		);
		await userEvent.type(
			screen.getByRole('textbox', { name: /body/i }),
			'My body',
		);
		await userEvent.click(screen.getByRole('button', { name: 'Create' }));

		await waitFor(() => {
			expect(createPost).toHaveBeenCalledWith({
				title: 'My title',
				body: 'My body',
			});
		});

		expect(onSuccess).toHaveBeenCalledWith({
			title: 'My title',
			body: 'My body',
		});
		expect(onFailure).not.toHaveBeenCalled();
	});

	it('prefills values and updates a post in edit mode', async () => {
		const onSuccess = vi.fn();
		const onCancel = vi.fn();
		const onFailure = vi.fn();

		vi.mocked(updatePost).mockResolvedValue({ _id: 'post-1' } as never);

		renderWithMantine(
			<PostForm
				mode="edit"
				postId="post-1"
				initialValues={{ title: 'Old title', body: 'Old body' }}
				onSuccess={onSuccess}
				onCancel={onCancel}
				onFailure={onFailure}
			/>,
		);

		expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue(
			'Old title',
		);
		expect(screen.getByRole('textbox', { name: /body/i })).toHaveValue(
			'Old body',
		);

		await userEvent.clear(screen.getByRole('textbox', { name: /title/i }));
		await userEvent.type(
			screen.getByRole('textbox', { name: /title/i }),
			'New title',
		);
		await userEvent.clear(screen.getByRole('textbox', { name: /body/i }));
		await userEvent.type(
			screen.getByRole('textbox', { name: /body/i }),
			'New body',
		);
		await userEvent.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor(() => {
			expect(updatePost).toHaveBeenCalledWith({
				_id: 'post-1',
				title: 'New title',
				body: 'New body',
			});
		});

		expect(onSuccess).toHaveBeenCalledWith({
			title: 'New title',
			body: 'New body',
		});
	});

	it('calls onFailure when create fails', async () => {
		const onSuccess = vi.fn();
		const onCancel = vi.fn();
		const onFailure = vi.fn();

		vi.mocked(createPost).mockRejectedValue(new Error('fail'));

		renderWithMantine(
			<PostForm
				onSuccess={onSuccess}
				onCancel={onCancel}
				onFailure={onFailure}
			/>,
		);

		await userEvent.type(
			screen.getByRole('textbox', { name: /title/i }),
			'My title',
		);
		await userEvent.type(
			screen.getByRole('textbox', { name: /body/i }),
			'My body',
		);
		await userEvent.click(screen.getByRole('button', { name: 'Create' }));

		await waitFor(() => {
			expect(onFailure).toHaveBeenCalledTimes(1);
		});

		expect(onSuccess).not.toHaveBeenCalled();
	});
});
