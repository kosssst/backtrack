'use client';

import { Container, Group, Image } from '@mantine/core';
import { UserCardSmall } from '@/components/containers/UserCardSmall';
import { UserProps } from '@/types/props.types';
import classes from '@/styles/MainHeader.module.css';
import Link from 'next/link';
import { VersionTag } from '@/components/containers/VersionTag';

export function MainHeader({ user }: UserProps) {
	return (
		<header className={classes.header}>
			<Container size="lg" className={classes.container}>
				<div className={classes.inner}>
					<Group>
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
						<VersionTag />
					</Group>
					<Link href="/profile" className={classes.profileLink}>
						<UserCardSmall user={user} />
					</Link>
				</div>
			</Container>
		</header>
	);
}
