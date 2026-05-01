import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ENV_KEYS = [
	'APP_ORIGIN',
	'MONGODB_URL',
	'ENCRYPTION_KEY',
	'BETTER_AUTH_SECRET',
	'NODE_ENV',
	'DEBUG',
	'LOG_LEVEL',
] as const;

const originalEnv = new Map<string, string | undefined>();
const validKey = Buffer.alloc(32, 7).toString('base64');

function setBaseEnv(overrides: Record<string, string | undefined> = {}) {
	for (const key of ENV_KEYS) {
		delete process.env[key];
	}

	Object.assign(process.env, {
		APP_ORIGIN: 'https://backtrack.example.com',
		MONGODB_URL: 'mongodb://db:27017/backtrack',
		ENCRYPTION_KEY: validKey,
		BETTER_AUTH_SECRET: 'auth-secret',
	});

	for (const [key, value] of Object.entries(overrides)) {
		if (value === undefined) {
			delete process.env[key];
		} else {
			process.env[key] = value;
		}
	}
}

describe('server runtime env', () => {
	beforeEach(() => {
		vi.resetModules();

		for (const key of ENV_KEYS) {
			originalEnv.set(key, process.env[key]);
		}
	});

	afterEach(() => {
		vi.resetModules();

		for (const key of ENV_KEYS) {
			const value = originalEnv.get(key);

			if (value === undefined) {
				delete process.env[key];
			} else {
				process.env[String(key)] = value;
			}
		}

		originalEnv.clear();
	});

	it('parses the canonical deploy environment', async () => {
		setBaseEnv({
			NODE_ENV: 'production',
			LOG_LEVEL: 'warn',
		});

		const { getServerEnv } =
			await import('@/shared/config/env/runtime/server-env');

		expect(getServerEnv()).toEqual({
			APP_ORIGIN: 'https://backtrack.example.com/',
			MONGODB_URL: 'mongodb://db:27017/backtrack',
			ENCRYPTION_KEY: Buffer.from(validKey, 'base64'),
			BETTER_AUTH_SECRET: 'auth-secret',
			NODE_ENV: 'production',
			DEBUG: false,
			LOG_LEVEL: 'warn',
		});
	});

	it('uses production logging defaults when LOG_LEVEL is absent', async () => {
		setBaseEnv({
			NODE_ENV: 'production',
		});

		const { getServerEnv } =
			await import('@/shared/config/env/runtime/server-env');

		expect(getServerEnv().LOG_LEVEL).toBe('info');
	});

	it('rejects missing required deployment variables', async () => {
		setBaseEnv({
			MONGODB_URL: undefined,
		});

		const { getServerEnv } =
			await import('@/shared/config/env/runtime/server-env');

		expect(() => getServerEnv()).toThrow('Missing env var: MONGODB_URL');
	});

	it('keeps logger env independent from required app deployment variables', async () => {
		for (const key of ENV_KEYS) {
			delete process.env[key];
		}

		process.env['NODE_ENV' as string] = 'production';

		const { getLoggerEnv } =
			await import('@/shared/config/env/runtime/logger-env');

		expect(getLoggerEnv()).toEqual({
			NODE_ENV: 'production',
			DEBUG: false,
			LOG_LEVEL: 'info',
		});
	});
});
