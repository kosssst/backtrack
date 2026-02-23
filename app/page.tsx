'use client';
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import { Button, Container, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CreatePostForm } from '@/components/forms/CreatePostForm';
import { PostsList } from '@/components/lists/PostsList';
import { useState } from 'react';

export default function Home() {
	const [opened, { open, close }] = useDisclosure(false);
	const [reloadKey, setReloadKey] = useState(0);

	const { data: session, isPending } = authClient.useSession();
	if (isPending) return <h1>Loading...</h1>;
	if (!session) redirect('/login');

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
				<Button onClick={open} mb="md">
					Create post
				</Button>
				<PostsList reloadKey={reloadKey} />
			</Container>
		</>
	);
}
