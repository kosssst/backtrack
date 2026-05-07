import { TagsModalProps } from '@/features/tags/types';
import { Group, Modal, Stack, Text } from '@mantine/core';
import classes from '@/features/tags/components/Tag.module.css';
import { CreateTagForm } from '@/features/tags/components/CreateTagForm';

export function TagsModal(props: TagsModalProps) {
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
					<CreateTagForm />
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
}
