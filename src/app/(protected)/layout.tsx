import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { buildAuthRedirect } from '@/lib/auth/redirect';
import { MainHeader } from '@/components/headers/MainHeader';

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
		<>
			<MainHeader user={session.user} />
			{children}
		</>
	);
}
