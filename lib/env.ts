const validLogLevels = ["debug", "info", "warn", "error"] as const;
type LogLevel = (typeof validLogLevels)[number];

const NODE_ENV = process.env.NODE_ENV ?? "production";

export const env = {
	NODE_ENV,
	APP_ORIGIN: mustUrl("APP_ORIGIN"),
	DEBUG: verifyBoolean(process.env.DEBUG || 'false'),
	LOG_LEVEL: verifyLogLevel(process.env.LOG_LEVEL),
}

function must(name: string): string {
	const v = process.env[name];
	if (!v) throw new Error(`Missing env var: ${name}`);
	return v;
}

function mustUrl(name: string) {
	const v = must(name);
	try {
		const url = new URL(v);
		console.log(url.toString());
		console.log(url.protocol, NODE_ENV);
		if (url.protocol !== "https:" && NODE_ENV !== "development") {
			console.log(url.protocol, NODE_ENV);
			throw new Error(`${name} must use HTTPS in production`);
		}
		return v;
	} catch (e) {
		throw new Error(`${name} must be a valid URL, error: ${e}`);
	}
}

function verifyBoolean(text: string) {
	return (text === "true");
}

function verifyLogLevel(text: string | undefined): LogLevel | null {
	if (!text) return null;
	return (validLogLevels as readonly string[]).includes(text) ? (text as LogLevel) : null;
}


