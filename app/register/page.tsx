import {Anchor, Button, Container, Group, Paper, PasswordInput, TextInput, Title} from "@mantine/core";

export default function registerPage() {
	return (
		<Container>
			<Title order={1}>Register</Title>
			<Paper>
				<TextInput label="Name" placeholder="John Doe" required radius="md" />
				<TextInput label="Email" placeholder="you@gmail.com" required mt="md" radius="md" />
				<PasswordInput label="Password" type="password" placeholder="Your password" required mt="md" radius="md" />
				<PasswordInput label="Repeat password" type="password" placeholder="Your password again" required mt="md" radius="md" />
				<Group>
					<Button mt="xl" radius="md">
						Sign up
					</Button>
					Already have an account? <Anchor href="/login">Sign in</Anchor>
				</Group>
			</Paper>
		</Container>
	);
}
