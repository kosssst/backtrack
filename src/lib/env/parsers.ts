export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function required(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Missing env var: ${name}`);
	return value;
}

export function optional(name: string): string | undefined {
	const value = process.env[name];
	return value && value.length > 0 ? value : undefined;
}

export function parseUrl(name: string): string {
	const value = required(name);
	try {
		return new URL(value).toString();
	} catch {
		throw new Error(`${name} must be a valid URL`);
	}
}

export function parseMongoUrl(name: string): string {
	const value = required(name);
	try {
		const url = new URL(value);
		if (url.protocol === 'mongodb:' || url.protocol === 'mongodb+srv:') {
			return value;
		}
	} catch {}
	throw new Error(`${name} must be a valid MongoDB URL`);
}

export function parseBase64Key32(name: string): Buffer {
	const value = required(name).trim();
	const buf = Buffer.from(value, 'base64');

	if (buf.toString('base64') !== value) {
		throw new Error(`${name} must be strict base64`);
	}
	if (buf.length !== 32) {
		throw new Error(`${name} must decode to exactly 32 bytes`);
	}

	return buf;
}

export function parseBoolean(
	value: string | undefined,
	fallback = false,
): boolean {
	if (value == null) return fallback;
	if (value === 'true') return true;
	if (value === 'false') return false;
	throw new Error(`Expected "true" or "false", got "${value}"`);
}

export function parseLogLevel(
	value: string | undefined,
	fallback: LogLevel,
): LogLevel {
	switch (value) {
		case undefined:
			return fallback;
		case 'debug':
		case 'info':
		case 'warn':
		case 'error':
			return value;
		default:
			throw new Error(`Invalid LOG_LEVEL: ${value}`);
	}
}
