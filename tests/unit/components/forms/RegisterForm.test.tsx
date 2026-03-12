import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const registerFormMocks = vi.hoisted(() => ({
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  },
  notify: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => registerFormMocks.router,
}));

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: registerFormMocks.notify,
  },
}));

vi.mock('@/lib/auth/auth-client', () => ({
  authClient: {
    signUp: {
      email: vi.fn(),
    },
  },
}));

import { authClient } from '@/lib/auth/auth-client';
import { RegisterForm } from '@/components/forms/RegisterForm';

describe('RegisterForm', () => {
  beforeEach(() => {
    registerFormMocks.router.replace.mockReset();
    registerFormMocks.router.refresh.mockReset();
    registerFormMocks.notify.mockReset();
    vi.mocked(authClient.signUp.email).mockReset();
  });

  it('submits sign-up data without repeatPassword and redirects on success', async () => {
    vi.mocked(authClient.signUp.email).mockImplementation(async (_values: any, options: any) => {
      options.onSuccess();
    });

    renderWithMantine(<RegisterForm redirectTo="/dashboard" />);

		await userEvent.type(
			screen.getByRole('textbox', { name: /name/i }),
			'John Doe',
		);
		await userEvent.type(
			screen.getByRole('textbox', { name: /email/i }),
			'john@example.com',
		);
		await userEvent.type(
			screen.getByLabelText(/^Password/i),
			'password123',
		);
		await userEvent.type(
			screen.getByLabelText(/^Repeat password/i),
			'password123',
		);
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => {
      expect(authClient.signUp.email).toHaveBeenCalledWith(
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        },
        expect.any(Object),
      );
    });
    expect(registerFormMocks.router.replace).toHaveBeenCalledWith('/dashboard');
    expect(registerFormMocks.router.refresh).toHaveBeenCalledTimes(1);
  });

  it('shows an error notification on registration failure', async () => {
    vi.mocked(authClient.signUp.email).mockImplementation(async (_values: any, options: any) => {
      options.onError();
    });

    renderWithMantine(<RegisterForm redirectTo="/dashboard" />);

		await userEvent.type(
			screen.getByRole('textbox', { name: /name/i }),
			'John Doe',
		);
		await userEvent.type(
			screen.getByRole('textbox', { name: /email/i }),
			'john@example.com',
		);
		await userEvent.type(
			screen.getByLabelText(/^Password/i),
			'password123',
		);
		await userEvent.type(
			screen.getByLabelText(/^Repeat password/i),
			'password123',
		);
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => {
      expect(registerFormMocks.notify).toHaveBeenCalledWith({
        title: 'Registration failed',
        message: 'Please check your details and try again.',
        color: 'red',
      });
    });
  });

  it('does not submit mismatched passwords', async () => {
    renderWithMantine(<RegisterForm redirectTo="/dashboard" />);

		await userEvent.type(
			screen.getByRole('textbox', { name: /name/i }),
			'John Doe',
		);
		await userEvent.type(
			screen.getByRole('textbox', { name: /email/i }),
			'john@example.com',
		);
		await userEvent.type(
			screen.getByLabelText(/^Password/i),
			'password123',
		);
		await userEvent.type(
			screen.getByLabelText(/^Repeat password/i),
			'password456',
		);
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => {
      expect(authClient.signUp.email).not.toHaveBeenCalled();
    });
    expect(screen.getByText('Passwords are not the same')).toBeInTheDocument();
  });
});
