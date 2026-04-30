import {
	formatPostDate,
	toISODateWithEndOfDay,
	toISODateWithStartOfDay,
} from '@/features/posts/utils/format-post-date';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('format-date utilities', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('formats post dates in HH:mm dd.MM.YYYY format', () => {
		expect(formatPostDate('2026-02-23T21:23:01.104Z')).toBe('21:23 23.02.2026');
	});

	it('uses empty strings when date formatter parts are missing', () => {
		vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function () {
			return {
				formatToParts: () => [],
			} as unknown as Intl.DateTimeFormat;
		} as unknown as typeof Intl.DateTimeFormat);

		expect(formatPostDate('2026-02-23T21:23:01.104Z')).toBe(': ..');
	});

	it('returns null when start-of-day input is empty', () => {
		expect(toISODateWithStartOfDay(null)).toBeNull();
	});

	it('returns null when end-of-day input is empty', () => {
		expect(toISODateWithEndOfDay(null)).toBeNull();
	});

	it('converts a date to the UTC start of the day', () => {
		expect(toISODateWithStartOfDay('2026-02-23')).toBe(
			'2026-02-23T00:00:00.000Z',
		);
	});

	it('converts a date to the UTC end of the day', () => {
		expect(toISODateWithEndOfDay('2026-02-23')).toBe(
			'2026-02-23T23:59:59.999Z',
		);
	});
});
