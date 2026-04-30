/**
 * Fetches a JSON response and raises the response body text for non-2xx responses.
 *
 * Keep this helper small and browser-compatible so feature API clients can share
 * the same credentials/error behavior without duplicating fetch boilerplate.
 */
export async function fetchJson<T>(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(input, init);

	if (!response.ok) {
		throw new Error(await response.text());
	}

	return (await response.json()) as T;
}
