import { PRICE_DECIMALS, round, tradeService, tradingAccountService, toFiniteNumber } from '@shared/services';
import type { TradeCalendarSummary } from '@shared/repositories';
import { toAccountOption } from '@shared/utils/account-option';
import type { CalendarData, CalendarDay, CalendarMonthTotals, CalendarTradeSummary } from '../types/calendar.types';

function toUtcDateKey(date: Date): string {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(date.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function daysInUtcMonth(year: number, month: number): number {
	return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function buildEmptyDays(year: number, month: number): CalendarDay[] {
	const total = daysInUtcMonth(year, month);
	const monthKey = String(month).padStart(2, '0');
	return Array.from({ length: total }, (_, index) => {
		const day = String(index + 1).padStart(2, '0');
		return { date: `${year}-${monthKey}-${day}`, profitLoss: 0, tradeCount: 0, tradeIds: [] };
	});
}

function buildMonthTotals(days: readonly CalendarDay[]): CalendarMonthTotals {
	let profitLoss = 0;
	let tradeCount = 0;
	let tradingDays = 0;
	let winDays = 0;
	let lossDays = 0;

	for (const day of days) {
		if (day.tradeCount === 0) {
			continue;
		}
		profitLoss += day.profitLoss;
		tradeCount += day.tradeCount;
		tradingDays += 1;
		if (day.profitLoss > 0) {
			winDays += 1;
		} else if (day.profitLoss < 0) {
			lossDays += 1;
		}
	}

	return { profitLoss: round(profitLoss, PRICE_DECIMALS), tradeCount, tradingDays, winDays, lossDays };
}

function toTradeSummaryDto(row: TradeCalendarSummary, profitLoss: number, closedAt: Date): CalendarTradeSummary {
	return {
		id: row.id,
		symbol: row.symbolTicker ?? 'Unknown',
		side: row.side,
		profitLoss,
		closedAt: closedAt.toISOString(),
	};
}

function emptyCalendar(year: number, month: number): CalendarData {
	return {
		year,
		month,
		days: buildEmptyDays(year, month),
		accounts: [],
		activeAccountId: null,
		currency: 'USD',
		monthTotals: buildMonthTotals([]),
		trades: [],
	};
}

export class CalendarService {
	async getCalendarData(userId: string, year: number, month: number, requestedAccountId?: string | null): Promise<CalendarData> {
		const accounts = await tradingAccountService.list(userId);

		if (accounts.length === 0) {
			return emptyCalendar(year, month);
		}

		const activeAccount =
			(requestedAccountId ? accounts.find((account) => account.id === requestedAccountId) : undefined) ??
			accounts.find((account) => account.isDefault) ??
			accounts[0];

		if (!activeAccount) {
			return emptyCalendar(year, month);
		}

		const monthStart = new Date(Date.UTC(year, month - 1, 1));
		const monthEnd = new Date(Date.UTC(year, month, 1));
		const closedRows = await tradeService.listClosedSummariesInRange(
			userId,
			activeAccount.id,
			monthStart,
			monthEnd,
		);

		const days = buildEmptyDays(year, month);
		const dayIndexByDate = new Map(days.map((day, index) => [day.date, index]));
		const trades: CalendarTradeSummary[] = [];

		for (const row of closedRows) {
			if (!row.closedAt) {
				continue;
			}
			const closedAt = row.closedAt;
			const dayIndex = dayIndexByDate.get(toUtcDateKey(closedAt));
			const day = dayIndex !== undefined ? days[dayIndex] : undefined;
			const profitLoss = toFiniteNumber(row.profitLoss);

			if (day) {
				day.profitLoss = round(day.profitLoss + profitLoss, PRICE_DECIMALS);
				day.tradeCount += 1;
				day.tradeIds.push(row.id);
			}

			trades.push(toTradeSummaryDto(row, profitLoss, closedAt));
		}

		return {
			year,
			month,
			days,
			accounts: accounts.map(toAccountOption),
			activeAccountId: activeAccount.id,
			currency: activeAccount.currency,
			monthTotals: buildMonthTotals(days),
			trades,
		};
	}
}

export const calendarService = new CalendarService();
