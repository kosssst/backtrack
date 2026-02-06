import {Anchor, Button, Checkbox, Container, Group, Paper, PasswordInput, TextInput, Title} from "@mantine/core";

export default function loginPage() {
	return (
		<Container>
			<Title order={1}>Login</Title>
			<Paper>
				<TextInput label="Email" placeholder="you@gmail.com" required radius="md" />
				<PasswordInput label="Password" type="password" placeholder="Your password" required mt="md" radius="md" />
					<Checkbox label="Remember me" />
				<Group>
					<Button mt="xl" radius="md">
						Sign in
					</Button>
					Don&#39;t have an account? <Anchor href="/register">Sign up</Anchor>
				</Group>
			</Paper>
		</Container>
	);
}
