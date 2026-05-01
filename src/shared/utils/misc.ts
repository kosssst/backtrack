export function toIntParam(value: string | null, fallback: number) {
	if (value == null || value.trim() === '') return fallback;

	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? parsed : fallback;
}
