import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { buildAuthRedirect } from '@/lib/auth/redirect';
import { MainHeader } from '@/components/headers/MainHeader';
import { MainFooter } from '@/components/footers/MainFooter';
import classes from '@/styles/ProtectedLayout.module.css';

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const headerStore = await headers();

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
