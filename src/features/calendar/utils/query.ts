/**
 * Single source of truth for turning a `URLSearchParams` into a validated `{ year, month,
 * accountId }` triple and back again. Used by the API route, the SSR Astro page, and the
 * client-side hook so the three never drift out of sync on param names or defaults.
 *
 * `month` is always 1-12 in every layer of the Calendar feature (never the 0-11 JS `Date`
 * index), and unset/invalid values default to the current UTC year/month.
 */
export interface CalendarQuery {
	year: number;
	month: number;
	accountId?: string;
}

function currentUtcYearMonth(): { year: number; month: number } {
	const now = new Date();
	return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

function toValidYear(value: string | null): number | null {
	const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
	return Number.isFinite(parsed) && parsed >= 1970 && parsed <= 9999 ? parsed : null;
}

function toValidMonth(value: string | null): number | null {
	const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
	return Number.isFinite(parsed) && parsed >= 1 && parsed <= 12 ? parsed : null;
}

export function parseCalendarQuery(params: URLSearchParams): CalendarQuery {
	const fallback = currentUtcYearMonth();
	return {
		year: toValidYear(params.get('year')) ?? fallback.year,
		month: toValidMonth(params.get('month')) ?? fallback.month,
		accountId: params.get('accountId') ?? undefined,
	};
}

export function buildCalendarQueryParams(query: CalendarQuery): URLSearchParams {
	const params = new URLSearchParams();
	params.set('year', String(query.year));
	params.set('month', String(query.month));
	if (query.accountId) {
		params.set('accountId', query.accountId);
	}
	return params;
}
