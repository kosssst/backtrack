import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/tags/api/tags-client', () => ({
	createTag: vi.fn(),
}));

vi.mock('@/shared/notifications/app-notifications', () => ({
	showFailure: vi.fn(),
	showSuccess: vi.fn(),
}));

import { createTag } from '@/features/tags/api/tags-client';
import { CreateTagForm } from '@/features/tags/components/CreateTagForm';
import { showSuccess } from '@/shared/notifications/app-notifications';

describe('CreateTagForm', () => {
	beforeEach(() => {
		vi.mocked(createTag).mockReset();
		vi.mocked(showSuccess).mockReset();
	});

	it('creates a tag with text and selected color from the form', async () => {
		vi.mocked(createTag).mockResolvedValue({ _id: 'tag-1' });

		renderWithMantine(<CreateTagForm />);

		await userEvent.type(
			screen.getByRole('textbox', { name: /name/i }),
			'Work',
		);
		await userEvent.click(
			screen.getByRole('button', { name: 'Select #ef4444' }),
		);
		await userEvent.click(screen.getByRole('button', { name: 'Create tag' }));

		await waitFor(() => {
			expect(createTag).toHaveBeenCalledWith({
				text: 'Work',
				color: '#ef4444',
			});
		});
		expect(showSuccess).toHaveBeenCalledWith('Tag created successfully');
	});
});
