import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const loginFormMocks = vi.hoisted(() => ({
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  },
  notify: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => loginFormMocks.router,
}));

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: loginFormMocks.notify,
  },
}));

vi.mock('@/lib/auth/auth-client', () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}));

import { authClient } from '@/lib/auth/auth-client';
import { LoginForm } from '@/components/forms/LoginForm';

describe('LoginForm', () => {
  beforeEach(() => {
    loginFormMocks.router.replace.mockReset();
    loginFormMocks.router.refresh.mockReset();
    loginFormMocks.notify.mockReset();
    vi.mocked(authClient.signIn.email).mockReset();
  });

  it('renders with remember me checked by default', () => {
    renderWithMantine(<LoginForm redirectTo="/dashboard" />);

    expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeChecked();
  });

  it('submits credentials and redirects on success', async () => {
    vi.mocked(authClient.signIn.email).mockImplementation(async (_values: any, options: any) => {
      options.onSuccess();
    });

    renderWithMantine(<LoginForm redirectTo="/dashboard" />);

		await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'john@example.com');
		await userEvent.type(screen.getByLabelText(/^Password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(authClient.signIn.email).toHaveBeenCalledWith(
        {
          email: 'john@example.com',
          password: 'password123',
          rememberMe: true,
        },
        expect.any(Object),
      );
    });
    expect(loginFormMocks.router.replace).toHaveBeenCalledWith('/dashboard');
    expect(loginFormMocks.router.refresh).toHaveBeenCalledTimes(1);
  });

  it('shows an error notification on auth failure', async () => {
    vi.mocked(authClient.signIn.email).mockImplementation(async (_values: any, options: any) => {
      options.onError();
    });

    renderWithMantine(<LoginForm redirectTo="/dashboard" />);

		await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'john@example.com');
		await userEvent.type(screen.getByLabelText(/^Password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(loginFormMocks.notify).toHaveBeenCalledWith({
        title: 'Authentication failed',
        message: 'Either email or password are incorrect.',
        color: 'red',
      });
    });
  });

  it('does not submit invalid input', async () => {
    renderWithMantine(<LoginForm redirectTo="/dashboard" />);

		await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'bad-email');
		await userEvent.type(screen.getByLabelText(/^Password/i), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(authClient.signIn.email).not.toHaveBeenCalled();
    });
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByText('Invalid password length')).toBeInTheDocument();
  });
});
