import { PostInterface } from '@/types/posts.types';
import { Paper, Stack, Title, Text } from '@mantine/core';
import { formatPostDate } from '@/lib/utils/format-date';

export function Post({ title, body, createdAt }: PostInterface) {
	return (
		<Paper withBorder shadow="md" radius="lg" p="xl">
			<Stack gap="md">
				<Title order={3}>{title}</Title>
				<Text style={{ whiteSpace: 'pre-wrap' }}>{body}</Text>
				<Text c="dimmed" ta="right" size="xs">
					{formatPostDate(createdAt)}
				</Text>
			</Stack>
		</Paper>
	);
}
