import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { headers } from 'next/headers';
import { getAuth } from '@/features/auth/server/auth';
import { getSafeRedirectPath } from '@/features/auth/server/redirect';
import { redirect } from 'next/navigation';
import { AuthPageProps } from '@/features/auth/types';

export default async function RegisterPage({ searchParams }: AuthPageProps) {
	const headerStore = await headers();
	const params = await searchParams;
	const redirectTo = getSafeRedirectPath(params.redirect);

	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: headerStore,
	});

	if (session?.user) redirect(redirectTo);

	return <RegisterForm redirectTo={redirectTo} />;
}
