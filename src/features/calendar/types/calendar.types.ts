import type { AccountOption, TradeSide } from '@shared/types';

/**
 * One UTC calendar day inside a rendered month. `date` is a stable `YYYY-MM-DD` key (UTC), and
 * every field is pre-aggregated by `CalendarService` — the UI only ever formats/displays these.
 */
export interface CalendarDay {
	/** UTC calendar date, e.g. `2026-07-12`. */
	date: string;
	/** Net realized P&L (sum of `profitLoss`) for closed trades on this UTC day. */
	profitLoss: number;
	/** Number of closed trades on this UTC day. */
	tradeCount: number;
	/** IDs of the closed trades on this UTC day, for looking up detail rows. */
	tradeIds: string[];
}

/** Aggregate stats for the whole rendered month, shown in the calendar header. */
export interface CalendarMonthTotals {
	/** Net realized P&L for the month. */
	profitLoss: number;
	/** Total closed trades in the month. */
	tradeCount: number;
	/** Number of UTC days with at least one closed trade. */
	tradingDays: number;
	/** Number of trading days with net-positive P&L. */
	winDays: number;
	/** Number of trading days with net-negative P&L. */
	lossDays: number;
}

/** Minimal per-trade summary shown in the day-detail panel, linking back to `/app/trades/[id]`. */
export interface CalendarTradeSummary {
	id: string;
	symbol: string;
	side: TradeSide;
	profitLoss: number;
	/** ISO timestamp (UTC) — the trade's `closedAt`. */
	closedAt: string;
}

/**
 * The full, ready-to-render Calendar payload for one month. Every number here is already
 * computed by `CalendarService` — components only format and display these values.
 */
export interface CalendarData {
	/** Calendar year, e.g. `2026`. */
	year: number;
	/** Calendar month, 1-12 (not the 0-11 JS `Date` index). */
	month: number;
	/** Every UTC day in the month, in order, including days with no trades. */
	days: CalendarDay[];
	accounts: AccountOption[];
	activeAccountId: string | null;
	currency: string;
	monthTotals: CalendarMonthTotals;
	/** Flat list of every closed trade in the month, for the day-detail dialog. */
	trades: CalendarTradeSummary[];
}
