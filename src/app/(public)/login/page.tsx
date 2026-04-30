import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthPageProps } from '@/features/auth/types';
import { headers } from 'next/headers';
import { getAuth } from '@/features/auth/server/auth';
import { getSafeRedirectPath } from '@/features/auth/server/redirect';
import { redirect } from 'next/navigation';

export default async function LoginPage({ searchParams }: AuthPageProps) {
	const headerStore = await headers();
	const params = await searchParams;
	const redirectTo = getSafeRedirectPath(params.redirect);

	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: headerStore,
	});

	if (session?.user) redirect(redirectTo);

	return <LoginForm redirectTo={redirectTo} />;
}
