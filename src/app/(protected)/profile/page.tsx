import { headers } from 'next/headers';
import { getAuth } from '@/features/auth/server/auth';
import { ProfilePageView } from '@/features/profile/components/ProfilePageView';

export default async function ProfilePage() {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) return null;

	return <ProfilePageView user={session.user} />;
}
