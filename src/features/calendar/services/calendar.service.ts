import { PRICE_DECIMALS, round, tradeService, tradingAccountService, toFiniteNumber } from '@shared/services';
import type { TradeCalendarSummary } from '@shared/repositories';
import { toAccountOption } from '@shared/utils/account-option';
import { calendarCacheKey, cacheGet, cacheSet } from '@shared/lib/cache/page-data-cache';
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

function assembleCalendar(
	year: number,
	month: number,
	accounts: Awaited<ReturnType<typeof tradingAccountService.list>>,
	activeAccount: NonNullable<(typeof accounts)[number]>,
	closedRows: TradeCalendarSummary[],
): CalendarData {
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

export class CalendarService {
	async getCalendarData(userId: string, year: number, month: number, requestedAccountId?: string | null): Promise<CalendarData> {
		const monthStart = new Date(Date.UTC(year, month - 1, 1));
		const monthEnd = new Date(Date.UTC(year, month, 1));

		if (requestedAccountId) {
			const cacheKey = calendarCacheKey(userId, requestedAccountId, year, month);
			const cached = await cacheGet<CalendarData>(cacheKey);
			if (cached) {
				return cached;
			}

			const [accounts, closedRows] = await Promise.all([
				tradingAccountService.list(userId),
				tradeService.listClosedSummariesInRange(userId, requestedAccountId, monthStart, monthEnd),
			]);

			if (accounts.length === 0) {
				return emptyCalendar(year, month);
			}

			const activeAccount = accounts.find((account) => account.id === requestedAccountId);
			if (activeAccount) {
				const data = assembleCalendar(year, month, accounts, activeAccount, closedRows);
				await cacheSet(cacheKey, data);
				return data;
			}

			const fallback = accounts.find((account) => account.isDefault) ?? accounts[0];
			if (!fallback) {
				return emptyCalendar(year, month);
			}

			const fallbackRows = await tradeService.listClosedSummariesInRange(
				userId,
				fallback.id,
				monthStart,
				monthEnd,
			);
			const data = assembleCalendar(year, month, accounts, fallback, fallbackRows);
			await cacheSet(calendarCacheKey(userId, fallback.id, year, month), data);
			return data;
		}

		const accounts = await tradingAccountService.list(userId);

		if (accounts.length === 0) {
			return emptyCalendar(year, month);
		}

		const activeAccount = accounts.find((account) => account.isDefault) ?? accounts[0];
		if (!activeAccount) {
			return emptyCalendar(year, month);
		}

		const cacheKey = calendarCacheKey(userId, activeAccount.id, year, month);
		const cached = await cacheGet<CalendarData>(cacheKey);
		if (cached) {
			return {
				...cached,
				accounts: accounts.map(toAccountOption),
				activeAccountId: activeAccount.id,
			};
		}

		const closedRows = await tradeService.listClosedSummariesInRange(
			userId,
			activeAccount.id,
			monthStart,
			monthEnd,
		);
		const data = assembleCalendar(year, month, accounts, activeAccount, closedRows);
		await cacheSet(cacheKey, data);
		return data;
	}
}

export const calendarService = new CalendarService();
