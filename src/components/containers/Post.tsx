import { PostInterface } from '@/types/posts.types';
import { Paper, Stack, Title, Text, Divider } from '@mantine/core';
import { formatPostDate } from '@/lib/utils/format-date';

export function Post({ title, body, createdAt }: PostInterface) {
	return (
		<Paper withBorder shadow="md" radius="lg" p="md">
			<Stack gap="sm">
				<Title order={3}>{title}</Title>
				<Divider />
				<Text style={{ whiteSpace: 'pre-wrap' }} mt="sm">
					{body}
				</Text>
				<Text c="dimmed" ta="right" size="xs">
					{formatPostDate(createdAt)}
				</Text>
			</Stack>
		</Paper>
	);
}
