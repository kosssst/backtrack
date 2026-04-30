'use client';

import { Container, Group, Image } from '@mantine/core';
import { UserCardSmall } from '@/features/profile/components/UserCardSmall';
import { UserProfileProps } from '@/features/profile/types';
import classes from './MainHeader.module.css';
import Link from 'next/link';
import { VersionTag } from '@/shared/components/version/VersionTag';

/**
 * Renders the authenticated application header.
 */
export function MainHeader({ user }: UserProfileProps) {
	return (
		<header className={classes.header}>
			<Container size="lg" className={classes.container}>
				<div className={classes.inner}>
					<Group gap={0}>
						<Link href="/" className={classes.logoLink}>
							<Image
								src="/backtrack-full-logo.svg"
								alt="Backtrack"
								className={classes.fullLogo}
								h={50}
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
