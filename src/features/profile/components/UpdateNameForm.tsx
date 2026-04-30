'use client';
import { UserProfileProps } from '@/features/profile/types';
import { isNotEmpty, useForm } from '@mantine/form';
import { Button, Stack, TextInput } from '@mantine/core';
import { authClient } from '@/features/auth/auth-client';
import { useRouter } from 'next/navigation';
import {
	showFailure,
	showSuccess,
} from '@/shared/notifications/app-notifications';

/**
 * Renders the account name update form.
 */
export function UpdateNameForm({ user }: UserProfileProps) {
	const router = useRouter();
	const form = useForm({
		mode: 'controlled',
		initialValues: {
			name: user.name,
		},
		validate: {
			name: isNotEmpty('Name cannot be empty'),
		},
	});

	const handleSubmit = async () => {
		await authClient.updateUser(form.getValues(), {
			onSuccess: () => {
				router.refresh();
				showSuccess('Name updated successfully');
			},
			onError: () => {
				showFailure('Name update failed');
			},
		});
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<Stack gap="md">
				<TextInput
					label="Name"
					placeholder="John Doe"
					required
					radius="md"
					key={form.key('name')}
					{...form.getInputProps('name')}
				/>
				<Button type="submit" radius="md">
					Update
				</Button>
			</Stack>
		</form>
	);
}
