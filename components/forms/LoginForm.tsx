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
import { authClient } from '@/lib/auth/auth-client';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import classes from '@/styles/form.module.css';

export function LoginForm() {
	const router = useRouter();

	const form = useForm({
		mode: 'controlled',
		initialValues: {
			email: '',
			password: '',
			rememberMe: true,
		},

		validate: {
			email: isEmail('Invalid email'),
			password: hasLength({ min: 8, max: 50 }, 'Invalid password length'),
		},
	});

	const handleSubmit = async () => {
		await authClient.signIn.email(form.getValues(), {
			onError: () => {
				notifications.show({
					title: 'Authentication failed',
					message: 'Either email or password are incorrect.',
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
					<Title order={2}>Welcome back</Title>
					<Text size="sm" className={classes.subtitle} mt={4}>
						Sign in to continue
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
								key={form.key('rememberMe')}
								{...form.getInputProps('rememberMe')}
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
