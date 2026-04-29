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
import { IconEdit, IconTrash } from '@tabler/icons-react';
import classes from '@/styles/Post.module.css';
import { PostForm } from '@/components/forms/PostForm';
import { notifications } from '@mantine/notifications';
import { PostFormValues } from '@/types/props.types';
import { openConfirmModal } from '@mantine/modals';
import { deletePost } from '@/lib/api/posts.client';

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

	const handleDelete = () => {
		openConfirmModal({
			title: 'Delete post',
			children: (
				<Text size="sm">
					Are you sure you want to delete this post? This action cannot be
					undone.
				</Text>
			),
			labels: {
				confirm: 'Delete',
				cancel: 'Cancel',
			},
			confirmProps: {
				color: 'red',
			},
			onConfirm: async () => {
				try {
					await deletePost({ _id: props._id });
					props.onDeleted(props._id);

					notifications.show({
						color: 'green',
						title: 'Success',
						message: 'Post deleted Successfully',
					});
				} catch {
					notifications.show({
						color: 'red',
						title: 'Failure',
						message: 'Failed to delete post',
					});
				}
			},
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
							<Group justify="flex-end">
								<ActionIcon
									variant="subtle"
									color="gray"
									onClick={() => {
										setEditing(true);
									}}
								>
									<IconEdit className={classes.editButton} size={20} />
								</ActionIcon>
								<ActionIcon
									variant="subtle"
									color="gray"
									onClick={handleDelete}
								>
									<IconTrash className={classes.deleteButton} size={20} />
								</ActionIcon>
							</Group>
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
