import { PostProps } from '@/types/posts.types';
import {
	Paper,
	Stack,
	Title,
	Text,
	Divider,
	Group,
	ActionIcon,
} from '@mantine/core';
import { formatPostDate } from '@/lib/utils/format-date';
import { useState } from 'react';
import { IconEdit } from '@tabler/icons-react';
import classes from '@/styles/Post.module.css';
import { PostForm } from '@/components/forms/PostForm';
import { notifications } from '@mantine/notifications';
import { PostFormValues } from '@/types/props.types';

export function Post(props: PostProps) {
	const [isEditing, setEditing] = useState(false);

	const handleSuccess = (values: PostFormValues) => {
		setEditing(false);
		props.onUpdated({
			_id: props._id,
			title: values.title,
			body: values.body,
			authorId: props.authorId,
			createdAt: props.createdAt,
			updatedAt: new Date().toISOString(),
		});
		notifications.show({
			color: 'green',
			title: 'Success',
			message: 'Post updated successfully',
		});
	};

	const handleFailure = () => {
		notifications.show({
			color: 'red',
			title: 'Failure',
			message: 'Failed to update post',
		});
	};

	return (
		<>
			{isEditing ? (
				<PostForm
					mode="edit"
					postId={props._id}
					initialValues={{ title: props.title, body: props.body }}
					onCancel={() => setEditing(false)}
					onSuccess={handleSuccess}
					onFailure={handleFailure}
				/>
			) : (
				<Paper withBorder shadow="md" radius="lg" p="md">
					<Stack gap="sm">
						<Group justify="space-between">
							<Title order={3}>{props.title}</Title>
							<ActionIcon
								variant="subtle"
								onClick={() => {
									setEditing(true);
								}}
							>
								<IconEdit className={classes.editButton} size={20} />
							</ActionIcon>
						</Group>
						<Divider />
						<Text style={{ whiteSpace: 'pre-wrap' }} mt="sm">
							{props.body}
						</Text>
						<Text c="dimmed" ta="right" size="xs">
							{formatPostDate(props.createdAt)}
						</Text>
					</Stack>
				</Paper>
			)}
		</>
	);
}
