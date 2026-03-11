import { Avatar, Card, Stack, Text, Title } from '@mantine/core';
import { UserProps } from '@/types/props.types';

export function UserCard({ user }: UserProps) {
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
			</Stack>
		</Card>
	);
}
