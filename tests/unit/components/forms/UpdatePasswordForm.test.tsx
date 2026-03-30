import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const updatePasswordMocks = vi.hoisted(() => ({
	notify: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: updatePasswordMocks.notify,
	},
}));

vi.mock('@/lib/auth/auth-client', () => ({
	authClient: {
		changePassword: vi.fn(),
	},
}));

import { authClient } from '@/lib/auth/auth-client';
import { UpdatePasswordForm } from '@/components/forms/UpdatePasswordForm';

describe('UpdatePasswordForm', () => {
	beforeEach(() => {
		updatePasswordMocks.notify.mockReset();
		vi.mocked(authClient.changePassword).mockReset();
	});

	it('submits the password change and resets the form on success', async () => {
		vi.mocked(authClient.changePassword).mockImplementation(
			async (_values: any, options: any) => {
				options.onSuccess();
			},
		);

		renderWithMantine(<UpdatePasswordForm />);

		const current = screen.getByLabelText(/^Current password/i);
		const next = screen.getByLabelText(/^New password/i);
		const repeat = screen.getByLabelText(/^Repeat password/i);

		await userEvent.type(current, 'old-password');
		await userEvent.type(next, 'new-password-123');
		await userEvent.type(repeat, 'new-password-123');
		await userEvent.click(screen.getByRole('button', { name: 'Update' }));

		await waitFor(() => {
			expect(authClient.changePassword).toHaveBeenCalledWith(
				{
					newPassword: 'new-password-123',
					currentPassword: 'old-password',
					revokeOtherSessions: true,
				},
				expect.any(Object),
			);
		});

		expect(current).toHaveValue('');
		expect(next).toHaveValue('');
		expect(repeat).toHaveValue('');
		expect(updatePasswordMocks.notify).toHaveBeenCalledWith({
			title: 'Success',
			message: 'Password changed successfully',
			color: 'green',
		});
	});

	it('does not submit when the new password matches the current password', async () => {
		renderWithMantine(<UpdatePasswordForm />);

		await userEvent.type(
			screen.getByLabelText(/^Current password/i),
			'same-password',
		);
		await userEvent.type(
			screen.getByLabelText(/^New password/i),
			'same-password',
		);
		await userEvent.type(
			screen.getByLabelText(/^Repeat password/i),
			'same-password',
		);
		await userEvent.click(screen.getByRole('button', { name: 'Update' }));

		await waitFor(() => {
			expect(authClient.changePassword).not.toHaveBeenCalled();
		});
		expect(
			screen.getByText('New password must be different from old password'),
		).toBeInTheDocument();
	});

	it('sets a field error when the current password is invalid', async () => {
		vi.mocked(authClient.changePassword).mockImplementation(
			async (_values: any, options: any) => {
				options.onError({ error: { code: 'INVALID_PASSWORD' } });
			},
		);

		renderWithMantine(<UpdatePasswordForm />);

		await userEvent.type(
			screen.getByLabelText(/^Current password/i),
			'wrong-password',
		);
		await userEvent.type(
			screen.getByLabelText(/^New password/i),
			'new-password-123',
		);
		await userEvent.type(
			screen.getByLabelText(/^Repeat password/i),
			'new-password-123',
		);
		await userEvent.click(screen.getByRole('button', { name: 'Update' }));

		await waitFor(() => {
			expect(screen.getByText('Incorrect password')).toBeInTheDocument();
		});
		expect(updatePasswordMocks.notify).toHaveBeenCalledWith({
			title: 'Failure',
			message: 'Failed to change password',
			color: 'red',
		});
	});
});
