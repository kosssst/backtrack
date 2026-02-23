export function formatPostDate(iso: string) {
	const d = new Date(iso);

	const parts = new Intl.DateTimeFormat(undefined, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		// timeZone: undefined  // <-- default: user's browser timezone
	}).formatToParts(d);

	const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';

	return `${get('hour')}:${get('minute')} ${get('day')}.${get('month')}.${get('year')}`;
}
