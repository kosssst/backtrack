import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/features/auth/server/auth';
import { buildAuthRedirect } from '@/features/auth/server/redirect';
import { MainHeader } from '@/shared/components/layout/MainHeader';
import { MainFooter } from '@/shared/components/layout/MainFooter';
import classes from '@/shared/components/layout/ProtectedLayout.module.css';

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const headerStore = await headers();
	const auth = await getAuth();

	const session = await auth.api.getSession({
		headers: headerStore,
	});

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
