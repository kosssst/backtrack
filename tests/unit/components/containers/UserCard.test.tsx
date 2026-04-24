import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const userCardMocks = vi.hoisted(() => ({
	router: {
		push: vi.fn(),
		replace: vi.fn(),
		refresh: vi.fn(),
	},
	notify: vi.fn(),
}));

vi.mock('next/navigation', () => ({
	useRouter: () => userCardMocks.router,
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: userCardMocks.notify,
	},
}));

vi.mock('@/lib/auth/auth-client', () => ({
	authClient: {
		signOut: vi.fn(),
	},
}));

import { authClient } from '@/lib/auth/auth-client';
import { UserCard } from '@/components/containers/UserCard';

describe('UserCard', () => {
	beforeEach(() => {
		userCardMocks.router.push.mockReset();
		userCardMocks.notify.mockReset();
		vi.mocked(authClient.signOut).mockReset();
	});

	it('renders the current user information', () => {
		renderWithMantine(
			<UserCard user={{ name: 'John Doe', email: 'john@example.com' }} />,
		);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('john@example.com')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Sign Out' }),
		).toBeInTheDocument();
	});

	it('redirects to login after a successful sign out', async () => {
		vi.mocked(authClient.signOut).mockImplementation(async (options: any) => {
			options.fetchOptions.onSuccess();
		});

		renderWithMantine(
			<UserCard user={{ name: 'John Doe', email: 'john@example.com' }} />,
		);

		await userEvent.click(screen.getByRole('button', { name: 'Sign Out' }));

		await waitFor(() => {
			expect(userCardMocks.router.push).toHaveBeenCalledWith('/login');
		});
	});

	it('shows an error notification when sign out fails', async () => {
		vi.mocked(authClient.signOut).mockImplementation(async (options: any) => {
			options.fetchOptions.onError();
		});

		renderWithMantine(
			<UserCard user={{ name: 'John Doe', email: 'john@example.com' }} />,
		);

		await userEvent.click(screen.getByRole('button', { name: 'Sign Out' }));

		await waitFor(() => {
			expect(userCardMocks.notify).toHaveBeenCalledWith({
				title: 'Failure',
				message: 'Something went wrong',
				color: 'red',
			});
		});
	});
});
