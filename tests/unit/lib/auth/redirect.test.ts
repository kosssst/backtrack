import { buildAuthRedirect, getSafeRedirectPath } from '@/lib/auth/redirect';
import { describe, expect, it } from 'vitest';

describe('redirect helpers', () => {
	it('falls back to root for empty redirect values', () => {
		expect(getSafeRedirectPath(undefined)).toBe('/');
		expect(getSafeRedirectPath(null)).toBe('/');
		expect(getSafeRedirectPath('')).toBe('/');
	});

	it('accepts safe internal paths including search params', () => {
		expect(getSafeRedirectPath('/profile?tab=security')).toBe(
			'/profile?tab=security',
		);
	});

	it('rejects absolute external URLs', () => {
		expect(getSafeRedirectPath('https://evil.example/steal')).toBe('/');
	});

	it('rejects protocol-relative URLs', () => {
		expect(getSafeRedirectPath('//evil.example/steal')).toBe('/');
	});

	it('rejects blocked auth routes', () => {
		expect(getSafeRedirectPath('/login')).toBe('/');
		expect(getSafeRedirectPath('/register')).toBe('/');
	});

	it('builds auth redirect with encoded return target only when safe', () => {
		expect(buildAuthRedirect('login', '/profile?tab=security')).toBe(
			'/login?redirect=%2Fprofile%3Ftab%3Dsecurity',
		);
	});

	it('omits redirect query when the fallback path is root', () => {
		expect(buildAuthRedirect('register', 'https://evil.example')).toBe(
			'/register',
		);
	});
});
