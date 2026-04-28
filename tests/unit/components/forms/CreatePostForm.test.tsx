import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

const createPostFormMocks = vi.hoisted(() => ({
	notify: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: createPostFormMocks.notify,
	},
}));

vi.mock('@/lib/api/posts.client', () => ({
	createPost: vi.fn(),
}));

import { createPost } from '@/lib/api/posts.client';
import { CreatePostForm } from '@/components/forms/CreatePostForm';

describe('CreatePostForm', () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		createPostFormMocks.notify.mockReset();
		vi.mocked(createPost).mockReset();
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	it('submits title and body and runs onSuccess on a successful create', async () => {
		const onSuccess = vi.fn();
		const onCancel = vi.fn();
		vi.mocked(createPost).mockResolvedValue({ _id: 'post-1' } as never);

		renderWithMantine(
			<CreatePostForm onSuccess={onSuccess} onCancel={onCancel} />,
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
		expect(onSuccess).toHaveBeenCalledTimes(1);
		expect(createPostFormMocks.notify).toHaveBeenCalledWith({
			title: 'Success',
			message: 'Post created successfully',
			color: 'green',
		});
	});

	it('shows an error notification when createPost fails', async () => {
		const onSuccess = vi.fn();
		const onCancel = vi.fn();
		vi.mocked(createPost).mockRejectedValue(new Error('fail'));

		renderWithMantine(
			<CreatePostForm onSuccess={onSuccess} onCancel={onCancel} />,
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
			expect(createPostFormMocks.notify).toHaveBeenCalledWith({
				title: 'Post creation failed',
				message: 'Something went wrong',
				color: 'red',
			});
		});
		expect(onSuccess).not.toHaveBeenCalled();
	});

	it('does not submit empty required fields', async () => {
		const onSuccess = vi.fn();
		const onCancel = vi.fn();
		renderWithMantine(
			<CreatePostForm onSuccess={onSuccess} onCancel={onCancel} />,
		);

		await userEvent.click(screen.getByRole('button', { name: /create/i }));

		expect(createPost).not.toHaveBeenCalled();

		expect(screen.getByRole('textbox', { name: /title/i })).toBeInvalid();
		expect(screen.getByRole('textbox', { name: /body/i })).toBeInvalid();
	});
});
