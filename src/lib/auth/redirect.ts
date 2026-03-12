const DEFAULT_REDIRECT_PATH = '/';
const BLOCKED_REDIRECT_PATHS = new Set(['/login', '/register']);

export function getSafeRedirectPath(value: string | null | undefined) {
	if (!value) return DEFAULT_REDIRECT_PATH;
	if (!value.startsWith('/')) return DEFAULT_REDIRECT_PATH;
	if (value.startsWith('//')) return DEFAULT_REDIRECT_PATH;

	try {
		const url = new URL(value, 'http://local-only');
		const safePath = `${url.pathname}${url.search}`;

		if (BLOCKED_REDIRECT_PATHS.has(url.pathname)) return DEFAULT_REDIRECT_PATH;

		return safePath || DEFAULT_REDIRECT_PATH;
	} catch {
		return DEFAULT_REDIRECT_PATH;
	}
}

export function buildAuthRedirect(
	mode: 'login' | 'register',
	returnTo: string | null | undefined,
) {
	const safeRedirect = getSafeRedirectPath(returnTo);
	const params = new URLSearchParams();

	if (safeRedirect !== DEFAULT_REDIRECT_PATH) {
		params.set('redirect', safeRedirect);
	}

	const query = params.toString();
	return query ? `/${mode}?${query}` : `/${mode}`;
}
