'use client';

import { useForm, matchesField } from '@mantine/form';
import { authClient } from '@/lib/auth/auth-client';
import { notifications } from '@mantine/notifications';
import { Button, PasswordInput, Stack } from '@mantine/core';

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
				if (value.length < 8 || value.length > 50) {
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
					notifications.show({
						title: 'Success',
						message: 'Password changed successfully',
						color: 'green',
					});
				},
				onError: ({ error }) => {
					if (error.code == 'INVALID_PASSWORD')
						form.setFieldError('oldPassword', 'Incorrect password');
					notifications.show({
						title: 'Failure',
						message: 'Failed to change password',
						color: 'red',
					});
				},
			},
		);
	};

	return (
		<form
			onSubmit={form.onSubmit(async () => {
				if (!form.isValid()) {
					form.validate();
					return;
				}
				await handleSubmit();
			})}
		>
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
