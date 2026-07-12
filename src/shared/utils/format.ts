/**
 * Pure display-formatting helpers.
 *
 * These functions only turn already-computed numbers into human-readable strings — they never
 * perform trading math themselves. All trading calculations must come from
 * `TradingCalculatorService` (`@shared/services`); this module is presentation-only.
 */

const DEFAULT_LOCALE = 'en-US';

export function formatCurrency(value: number, currency = 'USD'): string {
	return new Intl.NumberFormat(DEFAULT_LOCALE, {
		style: 'currency',
		currency,
		maximumFractionDigits: 2,
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

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
	const date = typeof value === 'string' ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) {
		return '—';
	}
	return new Intl.DateTimeFormat(
		DEFAULT_LOCALE,
		options ?? { month: 'short', day: 'numeric', year: 'numeric' },
	).format(date);
}

export function formatDateTime(value: string | Date): string {
	return formatDate(value, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});
}
