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
import { AuthRedirectProps, SignUpFormData } from '@/features/auth/types';
import { authClient } from '@/features/auth/auth-client';
import { useRouter } from 'next/navigation';
import classes from '@/shared/styles/form.module.css';
import { showFailure } from '@/shared/notifications/app-notifications';
import {
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
} from '@/features/auth/constants';

/**
 * Renders the registration form and signs the user in after successful account creation.
 */
export function RegisterForm({ redirectTo }: AuthRedirectProps) {
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
			password: hasLength(
				{ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH },
				'Invalid password',
			),
			repeatPassword: matchesField('password', 'Passwords are not the same'),
		},
	});

	const handleSubmit = async () => {
		const { repeatPassword: _repeatPassword, ...dataToSend } = form.getValues();

		await authClient.signUp.email(dataToSend, {
			onError: () => {
				showFailure(
					'Please check your details and try again.',
					'Registration failed',
				);
			},
			onSuccess: () => {
				router.replace(redirectTo);
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

				<form onSubmit={form.onSubmit(handleSubmit)}>
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
