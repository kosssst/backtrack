'use client';
import {
	Anchor,
	Button,
	Checkbox,
	Paper,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { hasLength, isEmail, useForm } from '@mantine/form';
import { authClient } from '@/features/auth/auth-client';
import { useRouter } from 'next/navigation';
import classes from '@/shared/styles/form.module.css';
import { AuthRedirectProps, SignInFormData } from '@/features/auth/types';
import { showFailure } from '@/shared/notifications/app-notifications';
import {
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
} from '@/features/auth/constants';

/**
 * Renders the public login form and redirects authenticated users after sign-in.
 */
export function LoginForm({ redirectTo }: AuthRedirectProps) {
	const router = useRouter();

	const form = useForm<SignInFormData>({
		mode: 'controlled',
		initialValues: {
			email: '',
			password: '',
			rememberMe: true,
		},

		validate: {
			email: isEmail('Invalid email'),
			password: hasLength(
				{ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH },
				'Invalid password length',
			),
		},
	});

	const handleSubmit = async () => {
		await authClient.signIn.email(form.getValues(), {
			onError: () => {
				showFailure(
					'Either email or password are incorrect.',
					'Authentication failed',
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
					<Title order={2}>Welcome back</Title>
					<Text size="sm" className={classes.subtitle} mt={4}>
						Sign in to continue
					</Text>
				</div>
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<Stack gap="md">
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

						<div className={classes.actions}>
							<Checkbox
								label="Remember me"
								{...form.getInputProps('rememberMe', { type: 'checkbox' })}
							/>
							<Button
								type="submit"
								radius="md"
								className={classes.fullWidthBtn}
							>
								Sign in
							</Button>
						</div>

						<div className={classes.footer}>
							<Text size="sm" c="dimmed">
								Don&apos;t have an account?
							</Text>
							<Anchor href="/register" size="sm">
								Sign up
							</Anchor>
						</div>
					</Stack>
				</form>
			</Paper>
		</div>
	);
}
