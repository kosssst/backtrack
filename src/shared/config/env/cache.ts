/**
 * Creates a lazy runtime-env getter.
 *
 * Environment parsing can throw, so values are cached only after a successful
 * parse. That keeps startup errors deterministic while avoiding repeated
 * parsing on hot paths.
 */
export function createRuntimeEnvGetter<T>(load: () => T) {
	let cached: T | undefined;

	return () => {
		if (cached) return cached;

		cached = load();
		return cached;
	};
}
