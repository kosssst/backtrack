/**
 * Central place for client-side error reporting.
 *
 * Today this writes to the console so test/dev failures remain visible. If the
 * app later adds telemetry, feature components can keep calling this function.
 */
export function reportClientError(error: unknown) {
	console.error(error);
}
