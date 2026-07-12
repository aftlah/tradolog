import type { AccountOption, TradeSide } from '@shared/types';

export interface CalendarDay {
	date: string;
	profitLoss: number;
	tradeCount: number;
	tradeIds: string[];
}

export interface CalendarMonthTotals {
	profitLoss: number;
	tradeCount: number;
	tradingDays: number;
	winDays: number;
	lossDays: number;
}

export interface CalendarTradeSummary {
	id: string;
	symbol: string;
	side: TradeSide;
	profitLoss: number;
	closedAt: string;
}

export interface CalendarData {
	year: number;
	month: number;
	days: CalendarDay[];
	accounts: AccountOption[];
	activeAccountId: string | null;
	currency: string;
	monthTotals: CalendarMonthTotals;
	trades: CalendarTradeSummary[];
}
