'use client';

import {
	Anchor,
	Button,
	Paper,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import {
	hasLength,
	isEmail,
	isNotEmpty,
	matchesField,
	useForm,
} from '@mantine/form';
import { SignUpFormData } from '@/types/auth.types';
import { authClient } from '@/lib/auth/auth-client';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import classes from '@/styles/form.module.css';

export function RegisterForm() {
	const router = useRouter();

	const form = useForm<SignUpFormData>({
		mode: 'controlled',
		initialValues: {
			name: '',
			email: '',
			password: '',
			repeatPassword: '',
		},
		validate: {
			name: isNotEmpty('Name cannot be empty'),
			email: isEmail('Invalid email'),
			password: hasLength({ min: 8, max: 50 }, 'Invalid password'),
			repeatPassword: matchesField('password', 'Passwords are not the same'),
		},
	});

	const handleSubmit = async () => {
		const { repeatPassword: _repeatPassword, ...dataToSend } = form.getValues();

		await authClient.signUp.email(dataToSend, {
			onError: () => {
				notifications.show({
					title: 'Registration failed',
					message: 'Please check your details and try again.',
					color: 'red',
				});
			},
			onSuccess: () => {
				router.replace('/');
				router.refresh();
			},
		});
	};

	return (
		<div className={classes.root}>
			<Paper className={classes.card} withBorder shadow="md" radius="lg" p="xl">
				<div className={classes.header}>
					<Title order={2}>Create an account</Title>
					<Text size="sm" className={classes.subtitle} mt={4}>
						Sign up to get started
					</Text>
				</div>

				<form
					onSubmit={form.onSubmit(async () => {
						if (!form.isValid()) {
							form.validate();
							return;
						}
						await handleSubmit();
					})}
				>
					<Stack gap="md">
						<TextInput
							label="Name"
							placeholder="John Doe"
							required
							radius="md"
							key={form.key('name')}
							{...form.getInputProps('name')}
						/>

						<TextInput
							label="Email"
							placeholder="you@gmail.com"
							required
							radius="md"
							key={form.key('email')}
							{...form.getInputProps('email')}
						/>

						<PasswordInput
							label="Password"
							placeholder="Your password"
							required
							radius="md"
							key={form.key('password')}
							{...form.getInputProps('password')}
						/>

						<PasswordInput
							label="Repeat password"
							placeholder="Your password again"
							required
							radius="md"
							key={form.key('repeatPassword')}
							{...form.getInputProps('repeatPassword')}
						/>

						<div className={classes.actions}>
							<Button
								type="submit"
								radius="md"
								className={classes.fullWidthBtn}
							>
								Sign up
							</Button>
						</div>

						<div className={classes.footer}>
							<Text size="sm" c="dimmed">
								Already have an account?
							</Text>
							<Anchor href="/login" size="sm">
								Sign in
							</Anchor>
						</div>
					</Stack>
				</form>
			</Paper>
		</div>
	);
}
