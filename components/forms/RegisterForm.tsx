'use client';
import {
	Anchor,
	Button,
	Container,
	Group,
	Paper,
	PasswordInput,
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
import { authClient } from '@/lib/auth-client';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

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
		if (!form.isValid()) {
			form.validate();
			return;
		}

		const { repeatPassword: _repeatPassword, ...dataToSend } = form.getValues();
		await authClient.signUp.email(dataToSend, {
			onError: () => {
				notifications.show({
					title: 'Registration failed',
					message: '',
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
			<Title order={1}>Register</Title>
			<Paper>
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
					mt="md"
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
				<PasswordInput
					label="Repeat password"
					type="password"
					placeholder="Your password again"
					required
					mt="md"
					radius="md"
					key={form.key('repeatPassword')}
					{...form.getInputProps('repeatPassword')}
				/>
				<Group>
					<Button mt="xl" radius="md" onClick={handleSubmit}>
						Sign up
					</Button>
					Already have an account? <Anchor href="/login">Sign in</Anchor>
				</Group>
			</Paper>
		</Container>
	);
}
