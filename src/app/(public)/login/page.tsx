import { LoginForm } from '@/components/forms/LoginForm';
import { AuthPageProps } from '@/types/props.types';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth/auth';
import { getSafeRedirectPath } from '@/lib/auth/redirect';
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
