/**
 * App wall-clock timezone for trade timestamps.
 * Vercel SSR runs in UTC — naive `datetime-local` strings must never be parsed with `new Date()` on the server.
 */
export const APP_TIMEZONE = 'Asia/Jakarta';

function pad2(value: number): string {
	return String(value).padStart(2, '0');
}

/** Offset of `timeZone` relative to UTC at `date`, in milliseconds (e.g. WIB = +7h). */
function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23',
	}).formatToParts(date);

	const read = (type: Intl.DateTimeFormatPartTypes): number => {
		const part = parts.find((entry) => entry.type === type);
		return Number.parseInt(part?.value ?? '0', 10);
	};

	const asUtcFromWall = Date.UTC(
		read('year'),
		read('month') - 1,
		read('day'),
		read('hour'),
		read('minute'),
		read('second'),
	);

	return asUtcFromWall - date.getTime();
}

/**
 * Converts an ISO / Date instant into `yyyy-MM-ddTHH:mm` for `<input type="datetime-local">`,
 * using a fixed timezone so SSR (Vercel) and the browser never disagree.
 */
export function toDatetimeLocalValue(
	iso: string | null | undefined,
	timeZone: string = APP_TIMEZONE,
): string {
	if (!iso) {
		return '';
	}
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return '';
	}

	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
	}).formatToParts(date);

	const read = (type: Intl.DateTimeFormatPartTypes): string =>
		parts.find((entry) => entry.type === type)?.value ?? '00';

	return `${read('year')}-${read('month')}-${read('day')}T${read('hour')}:${read('minute')}`;
}

/**
 * Interpret a `datetime-local` wall-clock string as `Asia/Jakarta` (default) → UTC ISO.
 * Must match `toDatetimeLocalValue` so round-trips never drift.
 */
export function datetimeLocalToIso(localValue: string, timeZone: string = APP_TIMEZONE): string {
	const date = zonedNaiveToUtcDate(localValue, timeZone);
	if (Number.isNaN(date.getTime())) {
		throw new Error('Invalid datetime.');
	}
	return date.toISOString();
}

/**
 * Interpret a naive `yyyy-MM-ddTHH:mm` (or with seconds) as wall time in `timeZone` → UTC Date.
 * Used when a legacy client still posts datetime-local without an offset.
 */
export function zonedNaiveToUtcDate(naive: string, timeZone: string = APP_TIMEZONE): Date {
	const [datePart, timePart = '00:00:00'] = naive.trim().split('T');
	const [year, month, day] = datePart.split('-').map((value) => Number.parseInt(value, 10));
	const [hour, minute, second = 0] = timePart.split(':').map((value) => Number.parseInt(value, 10));

	if (![year, month, day, hour, minute].every((value) => Number.isFinite(value))) {
		return new Date(Number.NaN);
	}

	const wallAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, Number.isFinite(second) ? second : 0);
	let utcMs = wallAsUtcMs - getTimeZoneOffsetMs(new Date(wallAsUtcMs), timeZone);
	const secondOffset = getTimeZoneOffsetMs(new Date(utcMs), timeZone);
	utcMs = wallAsUtcMs - secondOffset;
	return new Date(utcMs);
}

/**
 * Parse trade timestamps for the API / service layer.
 * Prefer full ISO with `Z` or offset; fall back to Asia/Jakarta wall time for naive strings.
 */
export function parseTradeDateTime(value: string): Date {
	const trimmed = value.trim();
	if (!trimmed) {
		return new Date(Number.NaN);
	}

	if (/z$/i.test(trimmed) || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
		return new Date(trimmed);
	}

	return zonedNaiveToUtcDate(trimmed, APP_TIMEZONE);
}

/** Optional helper when building labels — keeps pad consistent with datetime-local. */
export function formatTimeZoneHint(timeZone: string = APP_TIMEZONE): string {
	return timeZone === 'Asia/Jakarta' ? 'WIB' : timeZone;
}

export { pad2 };
