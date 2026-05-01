'use client';

import { useForm, matchesField } from '@mantine/form';
import { authClient } from '@/features/auth/auth-client';
import { Button, PasswordInput, Stack } from '@mantine/core';
import {
	showFailure,
	showSuccess,
} from '@/shared/notifications/app-notifications';
import {
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
} from '@/features/auth/constants';

/**
 * Renders the account password change form.
 */
export function UpdatePasswordForm() {
	const form = useForm({
		mode: 'controlled',
		initialValues: {
			oldPassword: '',
			newPassword: '',
			repeatPassword: '',
		},
		validate: {
			newPassword: (value, values) => {
				if (
					value.length < PASSWORD_MIN_LENGTH ||
					value.length > PASSWORD_MAX_LENGTH
				) {
					return 'Invalid password length';
				}

				if (value === values.oldPassword) {
					return 'New password must be different from old password';
				}

				return null;
			},
			repeatPassword: matchesField('newPassword', 'Passwords are not the same'),
		},
	});

	const handleSubmit = async () => {
		await authClient.changePassword(
			{
				newPassword: form.values.newPassword,
				currentPassword: form.values.oldPassword,
				revokeOtherSessions: true,
			},
			{
				onSuccess: () => {
					form.reset();
					showSuccess('Password changed successfully');
				},
				onError: ({ error }) => {
					if (error.code === 'INVALID_PASSWORD') {
						form.setFieldError('oldPassword', 'Incorrect password');
					}
					showFailure('Failed to change password');
				},
			},
		);
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<Stack gap="md">
				<PasswordInput
					label="Current password"
					placeholder="Current password"
					required
					radius="md"
					key={form.key('oldPassword')}
					{...form.getInputProps('oldPassword')}
				/>
				<PasswordInput
					label="New password"
					placeholder="New password"
					required
					radius="md"
					key={form.key('newPassword')}
					{...form.getInputProps('newPassword')}
				/>
				<PasswordInput
					label="Repeat password"
					placeholder="Repeat password"
					required
					radius="md"
					key={form.key('repeatPassword')}
					{...form.getInputProps('repeatPassword')}
				/>
				<Button type="submit" radius="md">
					Update
				</Button>
			</Stack>
		</form>
	);
}
