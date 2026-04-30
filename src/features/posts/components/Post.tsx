import { PostProps } from '@/features/posts/types';
import {
	ActionIcon,
	Divider,
	Group,
	Menu,
	Paper,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { formatPostDate } from '@/features/posts/utils/format-post-date';
import { useState } from 'react';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import classes from './Post.module.css';
import { PostForm } from '@/features/posts/components/PostForm';
import { PostContent } from '@/features/posts/types';
import { openConfirmModal } from '@mantine/modals';
import { deletePost } from '@/features/posts/api/posts-client';
import {
	showFailure,
	showSuccess,
} from '@/shared/notifications/app-notifications';

/**
 * Renders a post card with inline edit and delete actions.
 */
export function Post(props: PostProps) {
	const [isEditing, setEditing] = useState(false);

	const handleSuccess = (values: PostContent) => {
		setEditing(false);
		props.onUpdated({
			_id: props._id,
			title: values.title,
			body: values.body,
			authorId: props.authorId,
			createdAt: props.createdAt,
			updatedAt: new Date().toISOString(),
		});
		showSuccess('Post updated successfully');
	};

	const handleFailure = () => {
		showFailure('Failed to update post');
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

					showSuccess('Post deleted successfully');
				} catch {
					showFailure('Failed to delete post');
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
							<Menu shadow="md" width={100}>
								<Menu.Target>
									<ActionIcon
										variant="subtle"
										color="gray"
										aria-label="Post actions"
									>
										<IconDotsVertical size={20} />
									</ActionIcon>
								</Menu.Target>
								<Menu.Dropdown>
									<Menu.Item
										leftSection={<IconEdit size={14} />}
										onClick={() => setEditing(true)}
									>
										Edit
									</Menu.Item>
									<Menu.Item
										leftSection={<IconTrash size={14} />}
										onClick={handleDelete}
										className={classes.deleteButton}
									>
										Delete
									</Menu.Item>
								</Menu.Dropdown>
							</Menu>
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
