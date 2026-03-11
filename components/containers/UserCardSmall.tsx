import { UserCardProps } from '@/types/props.types';
import { Avatar, Text } from '@mantine/core';
import classes from '@/styles/UserCardSmall.module.css';

export function UserCardSmall({ name, email }: UserCardProps) {
	return (
		<div className={classes.card}>
			<Avatar name={name} radius="xl" className={classes.avatar} />
			<div className={classes.textBlock}>
				<Text className={classes.name}>{name}</Text>
				<Text className={classes.email}>{email}</Text>
			</div>
		</div>
	);
}
