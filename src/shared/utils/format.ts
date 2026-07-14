/**
 * Pure display-formatting helpers.
 *
 * These functions only turn already-computed numbers into human-readable strings — they never
 * perform trading math themselves. All trading calculations must come from
 * `TradingCalculatorService` (`@shared/services`); this module is presentation-only.
 */

const DEFAULT_LOCALE = 'en-US';

/** Currencies that never show fractional units — ICU defaults differ between Node and browsers. */
const ZERO_DECIMAL_CURRENCIES = new Set(['IDR', 'JPY', 'KRW', 'VND', 'CLP', 'ISK']);

function currencyFractionDigits(currency: string): number {
	return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 0 : 2;
}

export function formatCurrency(value: number, currency = 'USD'): string {
	const fractionDigits = currencyFractionDigits(currency);
	return new Intl.NumberFormat(DEFAULT_LOCALE, {
		style: 'currency',
		currency,
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(value);
}

/** Currency string with an explicit `+`/`−` sign, useful for P&L values. */
export function formatSignedCurrency(value: number, currency = 'USD'): string {
	const formatted = formatCurrency(Math.abs(value), currency);
	if (value > 0) {
		return `+${formatted}`;
	}
	if (value < 0) {
		return `-${formatted}`;
	}
	return formatted;
}

export function formatPercent(value: number, decimals = 1): string {
	return `${value.toFixed(decimals)}%`;
}

export function formatSignedPercent(value: number, decimals = 1): string {
	const formatted = formatPercent(Math.abs(value), decimals);
	if (value > 0) {
		return `+${formatted}`;
	}
	if (value < 0) {
		return `-${formatted}`;
	}
	return formatted;
}

export function formatNumber(value: number, decimals = 0): string {
	return new Intl.NumberFormat(DEFAULT_LOCALE, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value);
}

/** Formats a risk/reward ratio, e.g. `2.35R`. `null` renders as `"—"`. */
export function formatRiskReward(value: number | null, decimals = 2): string {
	if (value === null || !Number.isFinite(value)) {
		return '—';
	}
	return `${value.toFixed(decimals)}R`;
}

/** Formats a profit factor. `null` renders as `"—"`, `Infinity` renders as `"∞"`. */
export function formatProfitFactor(value: number | null, decimals = 2): string {
	if (value === null) {
		return '—';
	}
	if (!Number.isFinite(value)) {
		return '∞';
	}
	return value.toFixed(decimals);
}

/**
 * Always format in UTC so Vercel SSR (UTC) matches the browser during hydration.
 * Without an explicit timeZone, Node uses UTC and the client uses the local zone
 * (e.g. Asia/Jakarta) — that text mismatch throws React error #418 in production.
 */
export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
	const date = typeof value === 'string' ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) {
		return '—';
	}
	return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
		timeZone: 'UTC',
		...(options ?? { month: 'short', day: 'numeric', year: 'numeric' }),
	}).format(date);
}

/** Formats a holding-time duration in seconds as e.g. `2d 4h`, `3h 15m`, or `42m`. `null` renders as `"—"`. */
export function formatHoldingTime(seconds: number | null): string {
	if (seconds === null || !Number.isFinite(seconds) || seconds < 0) {
		return '—';
	}
	const totalMinutes = Math.round(seconds / 60);
	const days = Math.floor(totalMinutes / (60 * 24));
	const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
	const minutes = totalMinutes % 60;

	if (days > 0) {
		return `${days}d ${hours}h`;
	}
	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	return `${minutes}m`;
}

export function formatDateTime(value: string | Date): string {
	return formatDate(value, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZone: 'UTC',
	});
}
