import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ENV_KEYS = ['NODE_ENV', 'LOG_LEVEL'] as const;
const originalEnv = new Map<string, string | undefined>();

describe('server logger', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-05-01T12:00:00.000Z'));

		for (const key of ENV_KEYS) {
			originalEnv.set(key, process.env[key]);
		}

		process.env['NODE_ENV' as string] = 'production';
		process.env.LOG_LEVEL = 'debug';
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
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

	it('writes a uniform plain-text info line', async () => {
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const { logger } = await import('@/shared/logging/logger');

		logger.info('Server started', {
			nodeEnv: 'production',
			logLevel: 'info',
			appOrigin: 'https://backtrack.example.com/',
		});

		expect(infoSpy).toHaveBeenCalledWith(
			'2026-05-01T12:00:00.000Z INFO  [backtrack] Server started | appOrigin=https://backtrack.example.com/ logLevel=info nodeEnv=production',
		);
	});

	it('honors the configured log level threshold', async () => {
		process.env.LOG_LEVEL = 'warn';
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { logger } = await import('@/shared/logging/logger');

		logger.info('Hidden message');
		logger.warn('Visible message', { status: 503 });

		expect(infoSpy).not.toHaveBeenCalled();
		expect(warnSpy).toHaveBeenCalledWith(
			'2026-05-01T12:00:00.000Z WARN  [backtrack] Visible message | status=503',
		);
	});

	it('redacts credential-shaped metadata and formats errors on one line', async () => {
		const { formatLogLine } = await import('@/shared/logging/logger');
		const error = new Error('Mongo create failed');
		error.stack = 'Error: Mongo create failed\n    at createPost';

		const line = formatLogLine('error', 'Failed to create post', {
			authorization: 'Bearer secret-token',
			error,
			request: {
				headers: {
					cookie: 'session=secret-cookie',
				},
				body: {
					password: 'secret-password',
				},
			},
		});

		expect(line.startsWith('{')).toBe(false);
		expect(line).toContain('ERROR [backtrack] Failed to create post');
		expect(line).toContain('authorization="[REDACTED]"');
		expect(line).toContain('error.name=Error');
		expect(line).toContain('error.message="Mongo create failed"');
		expect(line).toContain(
			'error.stack="Error: Mongo create failed\\n    at createPost"',
		);
		expect(line).not.toContain('secret-token');
		expect(line).not.toContain('secret-cookie');
		expect(line).not.toContain('secret-password');
	});
});
