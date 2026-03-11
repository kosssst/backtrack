import { RegisterForm } from '@/components/forms/RegisterForm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { getSafeRedirectPath } from '@/lib/auth/redirect';
import { redirect } from 'next/navigation';
import { AuthPageProps } from '@/types/props.types';

export default async function RegisterPage({ searchParams }: AuthPageProps) {
	const headerStore = await headers();
	const session = await auth.api.getSession({
		headers: headerStore,
	});

	const params = await searchParams;
	const redirectTo = getSafeRedirectPath(params.redirect);

	if (session?.user) redirect(redirectTo);

	return <RegisterForm redirectTo={redirectTo} />;
}
