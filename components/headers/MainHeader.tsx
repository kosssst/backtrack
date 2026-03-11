'use client';

import { Container, Image } from '@mantine/core';
import { UserCardSmall } from '@/components/containers/UserCardSmall';
import { UserProps } from '@/types/props.types';
import classes from '@/styles/MainHeader.module.css';
import Link from 'next/link';

export function MainHeader({ user }: UserProps) {
	return (
		<header className={classes.header}>
			<Container size="lg" className={classes.container}>
				<div className={classes.inner}>
					<Link href="/" className={classes.logoLink}>
						<Image
							src={'/full-logo.png'}
							alt="logo"
							className={classes.fullLogo}
							h={40}
							w="auto"
							fit="contain"
						/>
					</Link>
					<Link href="/profile" className={classes.profileLink}>
						<UserCardSmall user={user} />
					</Link>
				</div>
			</Container>
		</header>
	);
}
