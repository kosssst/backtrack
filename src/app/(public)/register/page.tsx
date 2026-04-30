import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { AuthPageProps } from '@/features/auth/types';
import { requireAnonymousAuthPage } from '@/features/auth/server/auth-page';

/**
 * Renders the registration page for anonymous users.
 */
export default async function RegisterPage({ searchParams }: AuthPageProps) {
	const redirectTo = await requireAnonymousAuthPage(searchParams);

	return <RegisterForm redirectTo={redirectTo} />;
}
