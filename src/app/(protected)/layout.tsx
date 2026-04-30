import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { buildAuthRedirect } from '@/features/auth/server/redirect';
import { getCurrentSession } from '@/features/auth/server/session';
import { MainHeader } from '@/shared/components/layout/MainHeader';
import { MainFooter } from '@/shared/components/layout/MainFooter';
import classes from '@/shared/components/layout/ProtectedLayout.module.css';

/**
 * Guards authenticated pages and renders the shared application shell.
 */
export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const headerStore = await headers();
	const session = await getCurrentSession(headerStore);

	if (!session?.user) {
		const returnTo = headerStore.get('x-return-to');
		redirect(buildAuthRedirect('login', returnTo));
	}

	return (
		<div className={classes.layout}>
			<MainHeader user={session.user} />
			<main className={classes.main}>{children}</main>
			<MainFooter />
		</div>
	);
}
