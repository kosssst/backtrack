'use client';

import { UserProps } from '@/types/props.types';
import { Accordion, Grid } from '@mantine/core';
import { UserCard } from '@/components/containers/UserCard';
import { UpdateNameForm } from '@/components/forms/UpdateNameForm';
import { UpdatePasswordForm } from '@/components/forms/UpdatePasswordForm';

export function ProfilePageView({ user }: UserProps) {
	return (
		<Grid align="flex-start">
			<Grid.Col span={{ base: 12, md: 4 }}>
				<UserCard user={user} />
			</Grid.Col>
			<Grid.Col span={{ base: 12, md: 8 }}>
				<Accordion variant="separated" radius="lg" defaultValue="">
					<Accordion.Item value="change-name">
						<Accordion.Control>Change name</Accordion.Control>
						<Accordion.Panel>
							<UpdateNameForm user={user} />
						</Accordion.Panel>
					</Accordion.Item>
					<Accordion.Item value="change-password">
						<Accordion.Control>Change password</Accordion.Control>
						<Accordion.Panel>
							<UpdatePasswordForm />
						</Accordion.Panel>
					</Accordion.Item>
				</Accordion>
			</Grid.Col>
		</Grid>
	);
}
