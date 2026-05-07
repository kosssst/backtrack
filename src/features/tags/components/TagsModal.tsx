import { TagsModalProps } from '@/features/tags/types';
import { Group, Modal, Stack, Text } from '@mantine/core';
import classes from '@/features/tags/components/Tag.module.css';
import { TagForm } from '@/features/tags/components/TagForm';
import {
	showFailure,
	showSuccess,
} from '@/shared/notifications/app-notifications';

export function TagsModal(props: TagsModalProps) {
	const handleCreated = () => {
		showSuccess('Tag created successfully');
		props.onClose();
	};

	const handleFailed = () => {
		showFailure(
			'Please check your details and try again.',
			'Tag creation failed',
		);
	};

	return (
		<Modal.Root
			opened={props.opened}
			onClose={props.onClose}
			centered
			size={900}
		>
			<Modal.Overlay />
			<Modal.Content>
				<Modal.Header>
					<Stack gap="xs" style={{ width: '100%' }}>
						<Group justify="space-between">
							<Modal.Title className={classes.modalTitle}>
								Manage tags
							</Modal.Title>
							<Modal.CloseButton />
						</Group>
						<Text size="sm">
							Create, rename, and organize tags used to filter encrypted posts.
						</Text>
					</Stack>
				</Modal.Header>
				<Modal.Body>
					<TagForm
						onSuccess={handleCreated}
						onCancel={props.onClose}
						onFailure={handleFailed}
					/>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
}
