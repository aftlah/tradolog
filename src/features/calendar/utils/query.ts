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
