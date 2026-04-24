import { UserProps } from '@/types/props.types';
import { Avatar, Text } from '@mantine/core';
import classes from '@/styles/UserCardSmall.module.css';

export function UserCardSmall({ user }: UserProps) {
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
