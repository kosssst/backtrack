import { getCurrentSession } from '@/features/auth/server/session';
import { ProfilePageView } from '@/features/profile/components/ProfilePageView';

/**
 * Renders the current user's profile settings page.
 */
export default async function ProfilePage() {
	const session = await getCurrentSession();

	if (!session?.user) return null;

	return <ProfilePageView user={session.user} />;
}
