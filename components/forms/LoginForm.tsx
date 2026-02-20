'use client';
import {
	Anchor,
	Button,
	Checkbox,
	Container,
	Group,
	Paper,
	PasswordInput,
	TextInput,
	Title,
} from '@mantine/core';
import { hasLength, isEmail, useForm } from '@mantine/form';
import { authClient } from '@/lib/auth-client';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

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
		if (!form.isValid()) {
			form.validate();
			return;
		}

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
		<Container>
			<Title order={1}>Login</Title>
			<Paper>
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
					type="password"
					placeholder="Your password"
					required
					mt="md"
					radius="md"
					key={form.key('password')}
					{...form.getInputProps('password')}
				/>
				<Checkbox
					label="Remember me"
					key={form.key('rememberMe')}
					{...form.getInputProps('rememberMe', { type: 'checkbox' })}
				/>
				<Group>
					<Button mt="xl" radius="md" onClick={handleSubmit}>
						Sign in
					</Button>
					Don&#39;t have an account? <Anchor href="/register">Sign up</Anchor>
				</Group>
			</Paper>
		</Container>
	);
}
