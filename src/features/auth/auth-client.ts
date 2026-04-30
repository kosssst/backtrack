import { createAuthClient } from 'better-auth/react';

/** Browser-side Better Auth client configured for cookie-based sessions. */
export const authClient = createAuthClient({
	fetchOptions: { credentials: 'include' },
});
