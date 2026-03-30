import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateNameMocks = vi.hoisted(() => ({
	router: {
		push: vi.fn(),
		replace: vi.fn(),
		refresh: vi.fn(),
	},
	notify: vi.fn(),
}));

vi.mock('next/navigation', () => ({
	useRouter: () => updateNameMocks.router,
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: updateNameMocks.notify,
	},
}));

vi.mock('@/lib/auth/auth-client', () => ({
	authClient: {
		updateUser: vi.fn(),
	},
}));

import { authClient } from '@/lib/auth/auth-client';
import { UpdateNameForm } from '@/components/forms/UpdateNameForm';

describe('UpdateNameForm', () => {
	beforeEach(() => {
		updateNameMocks.router.refresh.mockReset();
		updateNameMocks.notify.mockReset();
		vi.mocked(authClient.updateUser).mockReset();
	});

	it('renders the current name as the initial value', () => {
		renderWithMantine(
			<UpdateNameForm user={{ name: 'John Doe', email: 'john@example.com' }} />,
		);

		expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
	});

	it('submits the new name and refreshes on success', async () => {
		vi.mocked(authClient.updateUser).mockImplementation(
			async (_values: any, options: any) => {
				options.onSuccess();
			},
		);

		renderWithMantine(
			<UpdateNameForm user={{ name: 'John Doe', email: 'john@example.com' }} />,
		);

		const input = screen.getByRole('textbox', { name: /name/i });
		await userEvent.clear(input);
		await userEvent.type(input, 'Jane Doe');
		await userEvent.click(screen.getByRole('button', { name: 'Update' }));

		await waitFor(() => {
			expect(authClient.updateUser).toHaveBeenCalledWith(
				{ name: 'Jane Doe' },
				expect.any(Object),
			);
		});
		expect(updateNameMocks.router.refresh).toHaveBeenCalledTimes(1);
		expect(updateNameMocks.notify).toHaveBeenCalledWith({
			title: 'Success',
			message: 'Name updated successfully',
			color: 'green',
		});
	});

	it('shows an error notification when the update fails', async () => {
		vi.mocked(authClient.updateUser).mockImplementation(
			async (_values: any, options: any) => {
				options.onError();
			},
		);

		renderWithMantine(
			<UpdateNameForm user={{ name: 'John Doe', email: 'john@example.com' }} />,
		);

		await userEvent.click(screen.getByRole('button', { name: 'Update' }));

		await waitFor(() => {
			expect(updateNameMocks.notify).toHaveBeenCalledWith({
				title: 'Failure',
				message: 'Name update failed',
				color: 'red',
			});
		});
	});
});
