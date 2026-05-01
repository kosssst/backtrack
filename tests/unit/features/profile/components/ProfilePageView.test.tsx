import { renderWithMantine } from '@test/render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/profile/components/UserCard', () => ({
	UserCard: ({ user }: any) => <div>UserCard:{user.name}</div>,
}));

vi.mock('@/features/profile/components/UpdateNameForm', () => ({
	UpdateNameForm: ({ user }: any) => <div>UpdateNameForm:{user.name}</div>,
}));

vi.mock('@/features/profile/components/UpdatePasswordForm', () => ({
	UpdatePasswordForm: () => <div>UpdatePasswordForm</div>,
}));

import { ProfilePageView } from '@/features/profile/components/ProfilePageView';

describe('ProfilePageView', () => {
	it('renders the profile layout and accordion sections', () => {
		renderWithMantine(
			<ProfilePageView
				user={{ name: 'John Doe', email: 'john@example.com' }}
			/>,
		);

		expect(screen.getByText('UserCard:John Doe')).toBeInTheDocument();
		expect(screen.getByText('Change name')).toBeInTheDocument();
		expect(screen.getByText('Change password')).toBeInTheDocument();
	});
});
