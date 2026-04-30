import { renderWithMantine } from '@test/render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
	default: ({ href, children, ...props }: any) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock('@/features/profile/components/UserCardSmall', () => ({
	UserCardSmall: ({ user }: any) => <span>UserCardSmall:{user.name}</span>,
}));

vi.mock('@/shared/components/version/VersionTag', () => ({
	VersionTag: () => <span>VersionTag</span>,
}));

import { MainHeader } from '@/shared/components/layout/MainHeader';

describe('MainHeader', () => {
	it('renders the home link, profile link, logo and subcomponents', () => {
		renderWithMantine(
			<MainHeader user={{ name: 'John Doe', email: 'john@example.com' }} />,
		);

		expect(screen.getByRole('link', { name: /backtrack/i })).toHaveAttribute(
			'href',
			'/',
		);
		expect(
			screen.getByRole('link', { name: /usercardsmall:john doe/i }),
		).toHaveAttribute('href', '/profile');
		expect(screen.getByText('VersionTag')).toBeInTheDocument();
		expect(screen.getByText('UserCardSmall:John Doe')).toBeInTheDocument();
	});
});
