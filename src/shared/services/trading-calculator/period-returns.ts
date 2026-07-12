/**
 * Daily / Weekly / Monthly return formulas.
 *
 * Trades are grouped by the UTC calendar day, ISO week (Monday-start), or calendar month in
 * which they were `closedAt`, per the project's "timezone aware timestamps, UTC" rule. When a
 * `startingBalance` is supplied, each period's percent return is computed against the running
 * equity at the *start* of that period; otherwise `returnPercent` is `null`.
 */
import { PERCENT_DECIMALS, PRICE_DECIMALS } from './constants';
import type { ClosedTradeResult, PeriodGranularity, PeriodReturn } from './types';
import { round, toFiniteNumber, toNullableDate } from './utils';

function startOfUtcDay(date: Date): Date {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfUtcWeek(date: Date): Date {
	const day = startOfUtcDay(date);
	// getUTCDay(): 0 = Sunday .. 6 = Saturday. Shift so Monday is the start of the week.
	const isoDayIndex = (day.getUTCDay() + 6) % 7;
	day.setUTCDate(day.getUTCDate() - isoDayIndex);
	return day;
}

function startOfUtcMonth(date: Date): Date {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function periodStartFor(date: Date, granularity: PeriodGranularity): Date {
	switch (granularity) {
		case 'day':
			return startOfUtcDay(date);
		case 'week':
			return startOfUtcWeek(date);
		case 'month':
			return startOfUtcMonth(date);
	}
}

function periodKeyFor(periodStart: Date, granularity: PeriodGranularity): string {
	const year = periodStart.getUTCFullYear();
	const month = String(periodStart.getUTCMonth() + 1).padStart(2, '0');
	if (granularity === 'month') {
		return `${year}-${month}`;
	}
	const day = String(periodStart.getUTCDate()).padStart(2, '0');
	return granularity === 'week' ? `${year}-${month}-${day}-W` : `${year}-${month}-${day}`;
}

/**
 * Groups closed trades into UTC day/week/month buckets and sums their realized P&L, optionally
 * computing a percent return per bucket relative to the running account equity at the start of
 * that bucket. Buckets are returned in chronological order. Trades with no `closedAt` are
 * ignored (they cannot be placed on the timeline).
 */
export function calculatePeriodReturns(
	trades: readonly ClosedTradeResult[],
	granularity: PeriodGranularity,
	startingBalance?: number,
): PeriodReturn[] {
	const dated = trades
		.map((trade) => ({ profitLoss: toFiniteNumber(trade.profitLoss), closedAt: toNullableDate(trade.closedAt) }))
		.filter((trade): trade is { profitLoss: number; closedAt: Date } => trade.closedAt !== null)
		.sort((a, b) => a.closedAt.getTime() - b.closedAt.getTime());

	const buckets = new Map<string, { periodStart: Date; profitLoss: number; tradeCount: number }>();

	for (const trade of dated) {
		const periodStart = periodStartFor(trade.closedAt, granularity);
		const key = periodKeyFor(periodStart, granularity);
		const existing = buckets.get(key);
		if (existing) {
			existing.profitLoss += trade.profitLoss;
			existing.tradeCount += 1;
		} else {
			buckets.set(key, { periodStart, profitLoss: trade.profitLoss, tradeCount: 1 });
		}
	}

	const orderedBuckets = [...buckets.entries()].sort(
		(a, b) => a[1].periodStart.getTime() - b[1].periodStart.getTime(),
	);

	let runningEquity = startingBalance;

	return orderedBuckets.map(([periodKey, bucket]) => {
		const profitLoss = round(bucket.profitLoss, PRICE_DECIMALS);
		let returnPercent: number | null = null;

		if (runningEquity !== undefined) {
			returnPercent = runningEquity > 0 ? round((profitLoss / runningEquity) * 100, PERCENT_DECIMALS) : null;
			runningEquity += profitLoss;
		}

		return {
			periodStart: bucket.periodStart,
			periodKey,
			profitLoss,
			tradeCount: bucket.tradeCount,
			returnPercent,
		};
	});
}

/** Daily Return = {@link calculatePeriodReturns} grouped by UTC calendar day. */
export function calculateDailyReturns(
	trades: readonly ClosedTradeResult[],
	startingBalance?: number,
): PeriodReturn[] {
	return calculatePeriodReturns(trades, 'day', startingBalance);
}

/** Weekly Return = {@link calculatePeriodReturns} grouped by ISO (Monday-start) UTC week. */
export function calculateWeeklyReturns(
	trades: readonly ClosedTradeResult[],
	startingBalance?: number,
): PeriodReturn[] {
	return calculatePeriodReturns(trades, 'week', startingBalance);
}

/** Monthly Return = {@link calculatePeriodReturns} grouped by UTC calendar month. */
export function calculateMonthlyReturns(
	trades: readonly ClosedTradeResult[],
	startingBalance?: number,
): PeriodReturn[] {
	return calculatePeriodReturns(trades, 'month', startingBalance);
}
