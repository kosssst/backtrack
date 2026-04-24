'use client';

import { Button, Container, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CreatePostForm } from '@/components/forms/CreatePostForm';
import { PostsList } from '@/components/lists/PostsList';
import { useState } from 'react';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';

export default function Home() {
	const [opened, { open, close }] = useDisclosure(false);
	const [reloadKey, setReloadKey] = useState(0);
	const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);

	const handleCreated = () => {
		close();
		setReloadKey((k) => k + 1);
	};

	return (
		<>
			<Modal.Root opened={opened} onClose={close}>
				<Modal.Overlay />
				<Modal.Content>
					<Modal.Header>
						<Modal.Title fw={600}>Create new post</Modal.Title>
						<Modal.CloseButton />
					</Modal.Header>
					<Modal.Body>
						<CreatePostForm onSuccess={handleCreated} />
					</Modal.Body>
				</Modal.Content>
			</Modal.Root>

			<Container size="md" px="md">
				<Group justify="space-between" align="center" mb="md">
					<Button onClick={open}>Create post</Button>
					<DatePickerInput
						style={{ flex: 1, maxWidth: 220 }}
						allowSingleDateInRange
						clearable
						type="range"
						value={dateRange}
						onChange={setDateRange}
						valueFormat="DD.MM.YYYY"
						label="Pick time range"
						placeholder="Pick dates"
						maxDate={new Date()}
					/>
				</Group>
				<PostsList reloadKey={reloadKey} dateRange={dateRange} />
			</Container>
		</>
	);
}
