import { Text } from '@mantine/core';
import { publicEnv } from '@/shared/config/public-env';
import classes from './VersionTag.module.css';

export function VersionTag() {
	return (
		<div className={classes.tag}>
			<Text className={classes.text}>v{publicEnv.APP_VERSION}</Text>
		</div>
	);
}
