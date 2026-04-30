import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthPageProps } from '@/features/auth/types';
import { requireAnonymousAuthPage } from '@/features/auth/server/auth-page';

/**
 * Renders the login page for anonymous users.
 */
export default async function LoginPage({ searchParams }: AuthPageProps) {
	const redirectTo = await requireAnonymousAuthPage(searchParams);

	return <LoginForm redirectTo={redirectTo} />;
}
