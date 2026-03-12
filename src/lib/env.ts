const validLogLevels = ['debug', 'info', 'warn', 'error'] as const;

type LogLevel = (typeof validLogLevels)[number];

export type AppEnv = {
	NODE_ENV: string;
	APP_ORIGIN: string;
	DEBUG: boolean;
	LOG_LEVEL: LogLevel | null;
	MONGODB_URL: string;
	ENCRYPTION_KEY: Buffer;
};

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
	if (cachedEnv) return cachedEnv;

	const NODE_ENV = process.env.NODE_ENV ?? 'production';

	cachedEnv = {
		NODE_ENV,
		APP_ORIGIN: mustUrl('APP_ORIGIN'),
		DEBUG: verifyBoolean(process.env.DEBUG || 'false'),
		LOG_LEVEL: verifyLogLevel(process.env.LOG_LEVEL),
		MONGODB_URL: mustDBURL('MONGODB_URL'),
		ENCRYPTION_KEY: mustBase64Key32('ENCRYPTION_KEY'),
	};

	return cachedEnv;
}

function must(name: string): string {
	const v = process.env[name];
	if (!v) throw new Error(`Missing env var: ${name}`);
	return v;
}

function mustUrl(name: string): string {
	const v = must(name);

	try {
		const url = new URL(v);
		return url.toString();
	} catch (e) {
		throw new Error(`${name} must be a valid URL, error: ${e}`);
	}
}

function mustDBURL(name: string): string {
	const v = must(name);

	try {
		const url = new URL(v);
		if (url.protocol === 'mongodb:' || url.protocol === 'mongodb+srv:') {
			return v;
		}
	} catch {}

	throw new Error(`${name} must be a valid MongoDB URL`);
}

function verifyBoolean(text: string): boolean {
	return text === 'true';
}

function verifyLogLevel(text: string | undefined): LogLevel | null {
	if (!text) return null;

	return (validLogLevels as readonly string[]).includes(text)
		? (text as LogLevel)
		: null;
}

function mustBase64Key32(name: string): Buffer {
	const s = must(name).trim();
	const buf = Buffer.from(s, 'base64');

	if (buf.toString('base64') !== s) {
		throw new Error(`${name} is not strict base64`);
	}

	if (buf.length !== 32) {
		throw new Error(`${name} must decode to 32 bytes (got ${buf.length})`);
	}

	return buf;
}
