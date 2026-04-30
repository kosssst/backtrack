/**
 * Formats an ISO timestamp for post cards as `HH:mm dd.MM.yyyy`.
 */
export function formatPostDate(iso: string) {
	const d = new Date(iso);

	const parts = new Intl.DateTimeFormat(undefined, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).formatToParts(d);

	const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';

	return `${get('hour')}:${get('minute')} ${get('day')}.${get('month')}.${get('year')}`;
}

/**
 * Converts a date-like value to the start of its UTC day for API filtering.
 */
export function toISODateWithStartOfDay(date: string | null) {
	if (!date) return null;
	const d = new Date(date);
	d.setUTCHours(0, 0, 0, 0);
	return d.toISOString();
}

/**
 * Converts a date-like value to the end of its UTC day for API filtering.
 */
export function toISODateWithEndOfDay(date: string | null) {
	if (!date) return null;
	const d = new Date(date);
	d.setUTCHours(23, 59, 59, 999);
	return d.toISOString();
}
