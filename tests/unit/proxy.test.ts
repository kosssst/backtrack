import { describe, expect, it, vi } from 'vitest';

const nextResponseMocks = vi.hoisted(() => ({
	next: vi.fn((init?: unknown) => init),
}));

vi.mock('next/server', async () => {
	const actual =
		await vi.importActual<typeof import('next/server')>('next/server');
	return {
		...actual,
		NextResponse: {
			next: nextResponseMocks.next,
		},
	};
});

import { config, proxy } from '@/proxy';

describe('proxy', () => {
	it('adds the x-return-to header with pathname and search string', () => {
		const request = {
			headers: new Headers({ 'x-test': '1' }),
			nextUrl: {
				pathname: '/profile',
				search: '?tab=security',
			},
		} as never;

		proxy(request);

		expect(nextResponseMocks.next).toHaveBeenCalledTimes(1);

		const init = nextResponseMocks.next.mock.calls[0]?.[0] as {
			request: { headers: Headers };
		};

		expect(init.request.headers.get('x-return-to')).toBe(
			'/profile?tab=security',
		);
		expect(init.request.headers.get('x-test')).toBe('1');
	});

	it('keeps the matcher configuration that excludes static and api paths', () => {
		expect(config.matcher).toEqual([
			'/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
		]);
	});
});
