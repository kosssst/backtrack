import { Anchor, Container, Group, Text } from '@mantine/core';
import classes from '@/styles/MainFooter.module.css';

export function MainFooter() {
	return (
		<footer className={classes.footer}>
			<Container size="lg" className={`${classes.container} appShell`}>
				<Group justify="center" align="center" wrap="wrap" gap="md">
					<Text size="sm" c="dimmed">
						©{new Date().getFullYear()} kosssst
					</Text>
					<Anchor
						href="https://github.com/kosssst/backtrack"
						target="_blank"
						rel="noopener noreferrer"
						className={classes.link}
					>
						Github
					</Anchor>
				</Group>
			</Container>
		</footer>
	);
}
