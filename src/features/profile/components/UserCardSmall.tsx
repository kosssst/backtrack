import { UserProfileProps } from '@/features/profile/types';
import { Avatar, Text } from '@mantine/core';
import classes from './UserCardSmall.module.css';

/**
 * Renders compact user identity information for the header.
 */
export function UserCardSmall({ user }: UserProfileProps) {
	return (
		<div className={classes.card}>
			<Avatar name={user.name} radius="xl" className={classes.avatar} />
			<div className={classes.textBlock}>
				<Text className={classes.name}>{user.name}</Text>
				<Text className={classes.email}>{user.email}</Text>
			</div>
		</div>
	);
}
