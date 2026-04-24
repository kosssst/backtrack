import { Text } from '@mantine/core';
import { publicEnv } from '@/lib/public-env';
import classes from '@/styles/VersionTag.module.css';

export function VersionTag() {
	return (
		<div className={classes.tag}>
			<Text className={classes.text}>v{publicEnv.APP_VERSION}</Text>
		</div>
	);
}
