import 'server-only';
import { inspect } from 'node:util';
import { getLoggerEnv } from '@/shared/config/env/runtime/logger-env';

const SERVICE_NAME = 'backtrack';
const REDACTED = '[REDACTED]';

const LEVEL_PRIORITY = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
} as const;

type LogLevel = keyof typeof LEVEL_PRIORITY;
export type LogFields = Record<string, unknown>;

const SENSITIVE_KEYS = new Set([
	'authorization',
	'cookie',
	'password',
	'token',
	'accesstoken',
	'refreshtoken',
	'secret',
]);

function isLogLevel(value: string): value is LogLevel {
	return value in LEVEL_PRIORITY;
}

function shouldLog(level: LogLevel) {
	const { LOG_LEVEL } = getLoggerEnv();
	return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[LOG_LEVEL];
}

function shouldRedactKey(key: string) {
	const normalized = key.toLowerCase().replace(/[-_]/g, '');

	return (
		SENSITIVE_KEYS.has(normalized) ||
		normalized.endsWith('password') ||
		normalized.endsWith('token') ||
		normalized.endsWith('secret')
	);
}

function redactValue(
	value: unknown,
	key = '',
	seen = new WeakSet<object>(),
): unknown {
	if (key && shouldRedactKey(key)) {
		return REDACTED;
	}

	if (value === null || typeof value !== 'object') {
		return value;
	}

	if (value instanceof Date || value instanceof Error) {
		return value;
	}

	if (seen.has(value)) {
		return '[Circular]';
	}

	seen.add(value);

	if (Array.isArray(value)) {
		return value.map((item) => redactValue(item, '', seen));
	}

	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>).map(
			([entryKey, entryValue]) => [
				entryKey,
				redactValue(entryValue, entryKey, seen),
			],
		),
	);
}

function formatKey(key: string) {
	return key.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

function stringifyValue(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (
		typeof value === 'number' ||
		typeof value === 'boolean' ||
		typeof value === 'bigint'
	) {
		return String(value);
	}

	if (value === null) {
		return 'null';
	}

	if (value === undefined) {
		return 'undefined';
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	return inspect(value, {
		breakLength: Infinity,
		compact: true,
		depth: 5,
	});
}

function formatValue(value: unknown) {
	const text = stringifyValue(value);

	if (/^[a-zA-Z0-9._~:/@%+=,-]+$/.test(text)) {
		return text;
	}

	return JSON.stringify(text);
}

function formatErrorFields(key: string, error: Error) {
	const fields = [
		`${formatKey(key)}.name=${formatValue(error.name)}`,
		`${formatKey(key)}.message=${formatValue(error.message)}`,
	];

	if (error.stack) {
		fields.push(`${formatKey(key)}.stack=${formatValue(error.stack)}`);
	}

	if (error.cause) {
		fields.push(
			`${formatKey(key)}.cause=${formatValue(redactValue(error.cause))}`,
		);
	}

	return fields;
}

function formatFields(fields: LogFields) {
	return Object.entries(fields)
		.sort(([left], [right]) => left.localeCompare(right))
		.flatMap(([key, value]) => {
			const redacted = redactValue(value, key);

			if (redacted instanceof Error) {
				return formatErrorFields(key, redacted);
			}

			return `${formatKey(key)}=${formatValue(redacted)}`;
		});
}

function normalizeMessage(message: string) {
	return message.replace(/\s+/g, ' ').trim();
}

export function formatLogLine(
	level: LogLevel,
	message: string,
	fields: LogFields = {},
) {
	const normalizedLevel = isLogLevel(level) ? level : 'info';
	const parts = [
		new Date().toISOString(),
		normalizedLevel.toUpperCase().padEnd(5),
		`[${SERVICE_NAME}]`,
		normalizeMessage(message),
	];
	const formattedFields = formatFields(fields);

	if (formattedFields.length > 0) {
		parts.push('|', ...formattedFields);
	}

	return parts.join(' ');
}

function writeLog(level: LogLevel, message: string, fields?: LogFields) {
	if (!shouldLog(level)) {
		return;
	}

	const line = formatLogLine(level, message, fields);

	switch (level) {
		case 'debug':
			console.debug(line);
			return;
		case 'info':
			console.info(line);
			return;
		case 'warn':
			console.warn(line);
			return;
		case 'error':
			console.error(line);
	}
}

/** Server logger that emits uniform one-line text logs with redacted metadata. */
export const logger = {
	debug(message: string, fields?: LogFields) {
		writeLog('debug', message, fields);
	},
	info(message: string, fields?: LogFields) {
		writeLog('info', message, fields);
	},
	warn(message: string, fields?: LogFields) {
		writeLog('warn', message, fields);
	},
	error(message: string, fields?: LogFields) {
		writeLog('error', message, fields);
	},
};
