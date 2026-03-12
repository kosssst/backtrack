import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { ProfilePageView } from '@/components/views/ProfilePageView';

export default async function ProfilePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) return null;

	return <ProfilePageView user={session.user} />;
}
