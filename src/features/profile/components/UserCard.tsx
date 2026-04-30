'use client';

import { Avatar, Button, Card, Stack, Text, Title } from '@mantine/core';
import { UserProfileProps } from '@/features/profile/types';
import { authClient } from '@/features/auth/auth-client';
import { useRouter } from 'next/navigation';
import { showFailure } from '@/shared/notifications/app-notifications';

/**
 * Renders the profile summary card and sign-out action.
 */
export function UserCard({ user }: UserProfileProps) {
	const router = useRouter();
	const handleLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push('/login');
				},
				onError: () => {
					showFailure('Something went wrong');
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
