'use client';
import { UserProps } from '@/types/props.types';
import { isNotEmpty, useForm } from '@mantine/form';
import { Button, Stack, TextInput } from '@mantine/core';
import { authClient } from '@/lib/auth/auth-client';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

export function UpdateNameForm({ user }: UserProps) {
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
				notifications.show({
					title: 'Success',
					message: 'Name updated successfully',
					color: 'green',
				});
			},
			onError: () => {
				notifications.show({
					title: 'Failure',
					message: 'Name update failed',
					color: 'red',
				});
			},
		});
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
