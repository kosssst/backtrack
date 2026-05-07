import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/tags/api/tags-client', () => ({
	createTag: vi.fn(),
	updateTag: vi.fn(),
}));

import { createTag, updateTag } from '@/features/tags/api/tags-client';
import { TagForm } from '@/features/tags/components/TagForm';

describe('TagForm', () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.mocked(createTag).mockReset();
		vi.mocked(updateTag).mockReset();
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	it('creates a tag and passes submitted values to onSuccess', async () => {
		const onSuccess = vi.fn();
		const onCancel = vi.fn();
		const onFailure = vi.fn();

		vi.mocked(createTag).mockResolvedValue({ _id: 'tag-1' });

		renderWithMantine(
			<TagForm
				onSuccess={onSuccess}
				onCancel={onCancel}
				onFailure={onFailure}
			/>,
		);

		await userEvent.type(
			screen.getByRole('textbox', { name: /name/i }),
			'Work',
		);
		await userEvent.click(
			screen.getByRole('button', { name: 'Select #ef4444' }),
		);
		await userEvent.click(screen.getByRole('button', { name: 'Create' }));

		await waitFor(() => {
			expect(createTag).toHaveBeenCalledWith({
				text: 'Work',
				color: '#ef4444',
			});
		});

		expect(onSuccess).toHaveBeenCalledWith({
			text: 'Work',
			color: '#ef4444',
		});
		expect(onFailure).not.toHaveBeenCalled();
	});

	it('prefills values and updates a tag in edit mode', async () => {
		const onSuccess = vi.fn();
		const onCancel = vi.fn();
		const onFailure = vi.fn();

		vi.mocked(updateTag).mockResolvedValue({ _id: 'tag-1' });

		renderWithMantine(
			<TagForm
				mode="edit"
				tagId="tag-1"
				initialValues={{ text: 'Old tag', color: '#ef4444' }}
				onSuccess={onSuccess}
				onCancel={onCancel}
				onFailure={onFailure}
			/>,
		);

		expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(
			'Old tag',
		);
		expect(
			screen.getByRole('button', { name: 'Select #ef4444' }),
		).toHaveAttribute('aria-pressed', 'true');

		await userEvent.clear(screen.getByRole('textbox', { name: /name/i }));
		await userEvent.type(
			screen.getByRole('textbox', { name: /name/i }),
			'New tag',
		);
		await userEvent.click(
			screen.getByRole('button', { name: 'Select #f97316' }),
		);
		await userEvent.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor(() => {
			expect(updateTag).toHaveBeenCalledWith({
				_id: 'tag-1',
				text: 'New tag',
				color: '#f97316',
			});
		});

		expect(onSuccess).toHaveBeenCalledWith({
			text: 'New tag',
			color: '#f97316',
		});
		expect(onFailure).not.toHaveBeenCalled();
	});

	it('calls onFailure when create fails', async () => {
		const onSuccess = vi.fn();
		const onCancel = vi.fn();
		const onFailure = vi.fn();

		vi.mocked(createTag).mockRejectedValue(new Error('fail'));

		renderWithMantine(
			<TagForm
				onSuccess={onSuccess}
				onCancel={onCancel}
				onFailure={onFailure}
			/>,
		);

		await userEvent.type(
			screen.getByRole('textbox', { name: /name/i }),
			'Work',
		);
		await userEvent.click(
			screen.getByRole('button', { name: 'Select #ef4444' }),
		);
		await userEvent.click(screen.getByRole('button', { name: 'Create' }));

		await waitFor(() => {
			expect(onFailure).toHaveBeenCalledTimes(1);
		});

		expect(onSuccess).not.toHaveBeenCalled();
	});

	it('calls onCancel when the cancel button is clicked', async () => {
		const onSuccess = vi.fn();
		const onCancel = vi.fn();
		const onFailure = vi.fn();

		renderWithMantine(
			<TagForm
				onSuccess={onSuccess}
				onCancel={onCancel}
				onFailure={onFailure}
			/>,
		);

		await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

		expect(onCancel).toHaveBeenCalledTimes(1);
		expect(createTag).not.toHaveBeenCalled();
		expect(onSuccess).not.toHaveBeenCalled();
	});
});
