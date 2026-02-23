'use client';
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import { Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CreatePostForm } from '@/components/forms/CreatePostForm';

export default function Home() {
	const [opened, { open, close }] = useDisclosure(false);
	const { data: session, isPending } = authClient.useSession();
	if (isPending) return <h1>Loading...</h1>;
	if (!session) redirect('/login');

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
						<CreatePostForm onSuccess={close} />
					</Modal.Body>
				</Modal.Content>
			</Modal.Root>

			<Button onClick={open}>Create post</Button>
		</>
	);
}
