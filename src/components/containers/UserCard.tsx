'use client';

import { Avatar, Button, Card, Stack, Text, Title } from '@mantine/core';
import { UserProps } from '@/types/props.types';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

export function UserCard({ user }: UserProps) {
	const router = useRouter();
	const handleLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push('/login');
				},
				onError: () => {
					notifications.show({
						title: 'Failure',
						message: 'Something went wrong',
						color: 'red',
					});
				},
			},
		});
	};

	return (
		<Card withBorder radius="lg" p="xl">
			<Stack gap="md" align="center">
				<Avatar radius="xl" size={96} name={user.name} />
				<Stack gap={4} align="center">
					<Title order={4} ta="center">
						{user.name}
					</Title>
					<Text c="dimmed" size="sm" ta="center">
						{user.email}
					</Text>
				</Stack>
				<Button type="submit" onClick={handleLogout} radius="md">
					Sign Out
				</Button>
			</Stack>
		</Card>
	);
}
