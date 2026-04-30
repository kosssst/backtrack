import { NextRequest, NextResponse } from 'next/server';

/**
 * Adds the current path to request headers so protected layouts can redirect
 * unauthenticated users back to their original destination after login.
 */
export function proxy(request: NextRequest) {
	const requestHeaders = new Headers(request.headers);
	const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;

	requestHeaders.set('x-return-to', returnTo);

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
}

/** Next.js proxy matcher for non-static, non-API routes. */
export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
	],
};
