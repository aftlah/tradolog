import { PRICE_DECIMALS, round, toFiniteNumber, type ClosedTradeResult } from '@shared/services/trading-calculator';

export const RISK_ALERT_RULE_IDS = [
	'daily_loss_amount',
	'daily_loss_percent',
	'weekly_loss_amount',
	'weekly_loss_percent',
	'max_trades_per_day',
	'max_consecutive_losses',
] as const;

export type RiskAlertRuleId = (typeof RISK_ALERT_RULE_IDS)[number];
export type RiskAlertSeverity = 'warning' | 'danger';

export interface RiskRuleLimits {
	enabled: boolean;
	maxDailyLossAmount: number | null;
	maxDailyLossPercent: number | null;
	maxWeeklyLossAmount: number | null;
	maxWeeklyLossPercent: number | null;
	maxTradesPerDay: number | null;
	maxConsecutiveLosses: number | null;
}

export interface RiskAlert {
	ruleId: RiskAlertRuleId;
	severity: RiskAlertSeverity;
	title: string;
	message: string;
	/** Current measured value (loss as positive amount when applicable). */
	currentValue: number;
	limitValue: number;
	unit: 'currency' | 'percent' | 'count';
}

export interface EvaluateRiskRulesInput {
	limits: RiskRuleLimits;
	closedTrades: readonly ClosedTradeResult[];
	startingBalance: number;
	/** IANA timezone used to bucket "today" / "this week". */
	timeZone: string;
	now?: Date;
}

const WARNING_RATIO = 0.8;

function zonedDateParts(date: Date, timeZone: string): { year: number; month: number; day: number } {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).formatToParts(date);

	const read = (type: Intl.DateTimeFormatPartTypes): number =>
		Number.parseInt(parts.find((part) => part.type === type)?.value ?? '0', 10);

	return { year: read('year'), month: read('month'), day: read('day') };
}

function dateKey(date: Date, timeZone: string): string {
	const { year, month, day } = zonedDateParts(date, timeZone);
	return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Monday-start ISO week key in `timeZone` (YYYY-Www). */
function weekKey(date: Date, timeZone: string): string {
	const { year, month, day } = zonedDateParts(date, timeZone);
	const utcNoon = new Date(Date.UTC(year, month - 1, day, 12));
	const dayOfWeek = utcNoon.getUTCDay(); // 0 Sun … 6 Sat
	const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
	const monday = new Date(utcNoon);
	monday.setUTCDate(utcNoon.getUTCDate() + mondayOffset);
	const mondayParts = {
		year: monday.getUTCFullYear(),
		month: monday.getUTCMonth() + 1,
		day: monday.getUTCDate(),
	};
	const jan4 = new Date(Date.UTC(mondayParts.year, 0, 4));
	const week1Monday = new Date(jan4);
	const jan4Dow = jan4.getUTCDay();
	week1Monday.setUTCDate(jan4.getUTCDate() + (jan4Dow === 0 ? -6 : 1 - jan4Dow));
	const week =
		Math.floor((monday.getTime() - week1Monday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
	return `${mondayParts.year}-W${String(Math.max(1, week)).padStart(2, '0')}`;
}

function toClosedAt(trade: ClosedTradeResult): Date | null {
	if (!trade.closedAt) {
		return null;
	}
	return trade.closedAt instanceof Date ? trade.closedAt : new Date(trade.closedAt);
}

function sumPnl(trades: readonly ClosedTradeResult[]): number {
	let total = 0;
	for (const trade of trades) {
		total += toFiniteNumber(trade.profitLoss);
	}
	return round(total, PRICE_DECIMALS);
}

/** Loss magnitude is positive when net P&L is negative. */
function lossMagnitude(netPnl: number): number {
	return netPnl < 0 ? round(Math.abs(netPnl), PRICE_DECIMALS) : 0;
}

function pushLimitAlert(
	alerts: RiskAlert[],
	ruleId: RiskAlertRuleId,
	title: string,
	currentValue: number,
	limitValue: number,
	unit: RiskAlert['unit'],
	formatMessage: (severity: RiskAlertSeverity) => string,
): void {
	if (limitValue <= 0 || currentValue <= 0) {
		return;
	}
	if (currentValue >= limitValue) {
		alerts.push({
			ruleId,
			severity: 'danger',
			title,
			message: formatMessage('danger'),
			currentValue,
			limitValue,
			unit,
		});
		return;
	}
	if (currentValue >= limitValue * WARNING_RATIO) {
		alerts.push({
			ruleId,
			severity: 'warning',
			title,
			message: formatMessage('warning'),
			currentValue,
			limitValue,
			unit,
		});
	}
}

/**
 * Pure risk-rule evaluator — no I/O. Used by Dashboard (and later trade guards).
 */
export function evaluateRiskRules(input: EvaluateRiskRulesInput): RiskAlert[] {
	const { limits, closedTrades, startingBalance, timeZone } = input;
	if (!limits.enabled) {
		return [];
	}

	const now = input.now ?? new Date();
	const todayKey = dateKey(now, timeZone);
	const thisWeekKey = weekKey(now, timeZone);

	const todayTrades = closedTrades.filter((trade) => {
		const closedAt = toClosedAt(trade);
		return closedAt !== null && dateKey(closedAt, timeZone) === todayKey;
	});
	const weekTrades = closedTrades.filter((trade) => {
		const closedAt = toClosedAt(trade);
		return closedAt !== null && weekKey(closedAt, timeZone) === thisWeekKey;
	});

	const dailyPnl = sumPnl(todayTrades);
	const weeklyPnl = sumPnl(weekTrades);
	const dailyLoss = lossMagnitude(dailyPnl);
	const weeklyLoss = lossMagnitude(weeklyPnl);
	const tradesToday = todayTrades.length;

	const chronological = [...closedTrades].sort((a, b) => {
		const aTime = toClosedAt(a)?.getTime() ?? 0;
		const bTime = toClosedAt(b)?.getTime() ?? 0;
		return aTime - bTime;
	});
	let currentLossStreak = 0;
	for (let index = chronological.length - 1; index >= 0; index -= 1) {
		const pnl = toFiniteNumber(chronological[index]?.profitLoss);
		if (pnl < 0) {
			currentLossStreak += 1;
			continue;
		}
		break;
	}

	const alerts: RiskAlert[] = [];
	const balance = startingBalance > 0 ? startingBalance : 0;

	if (limits.maxDailyLossAmount !== null) {
		pushLimitAlert(
			alerts,
			'daily_loss_amount',
			'Daily loss limit',
			dailyLoss,
			limits.maxDailyLossAmount,
			'currency',
			(severity) =>
				severity === 'danger'
					? `Daily loss reached the ${limits.maxDailyLossAmount} account-currency limit.`
					: `Daily loss is nearing your ${limits.maxDailyLossAmount} limit.`,
		);
	}

	if (limits.maxDailyLossPercent !== null && balance > 0) {
		const dailyLossPercent = round((dailyLoss / balance) * 100, 2);
		pushLimitAlert(
			alerts,
			'daily_loss_percent',
			'Daily loss %',
			dailyLossPercent,
			limits.maxDailyLossPercent,
			'percent',
			(severity) =>
				severity === 'danger'
					? `Daily loss hit ${limits.maxDailyLossPercent}% of starting balance.`
					: `Daily loss is nearing ${limits.maxDailyLossPercent}% of starting balance.`,
		);
	}

	if (limits.maxWeeklyLossAmount !== null) {
		pushLimitAlert(
			alerts,
			'weekly_loss_amount',
			'Weekly loss limit',
			weeklyLoss,
			limits.maxWeeklyLossAmount,
			'currency',
			(severity) =>
				severity === 'danger'
					? `Weekly loss reached the ${limits.maxWeeklyLossAmount} account-currency limit.`
					: `Weekly loss is nearing your ${limits.maxWeeklyLossAmount} limit.`,
		);
	}

	if (limits.maxWeeklyLossPercent !== null && balance > 0) {
		const weeklyLossPercent = round((weeklyLoss / balance) * 100, 2);
		pushLimitAlert(
			alerts,
			'weekly_loss_percent',
			'Weekly loss %',
			weeklyLossPercent,
			limits.maxWeeklyLossPercent,
			'percent',
			(severity) =>
				severity === 'danger'
					? `Weekly loss hit ${limits.maxWeeklyLossPercent}% of starting balance.`
					: `Weekly loss is nearing ${limits.maxWeeklyLossPercent}% of starting balance.`,
		);
	}

	if (limits.maxTradesPerDay !== null) {
		pushLimitAlert(
			alerts,
			'max_trades_per_day',
			'Max trades / day',
			tradesToday,
			limits.maxTradesPerDay,
			'count',
			(severity) =>
				severity === 'danger'
					? `You closed ${tradesToday} trades today (limit ${limits.maxTradesPerDay}).`
					: `Trade count today (${tradesToday}) is nearing the limit of ${limits.maxTradesPerDay}.`,
		);
	}

	if (limits.maxConsecutiveLosses !== null) {
		pushLimitAlert(
			alerts,
			'max_consecutive_losses',
			'Loss streak',
			currentLossStreak,
			limits.maxConsecutiveLosses,
			'count',
			(severity) =>
				severity === 'danger'
					? `Current loss streak is ${currentLossStreak} (limit ${limits.maxConsecutiveLosses}).`
					: `Loss streak (${currentLossStreak}) is nearing ${limits.maxConsecutiveLosses}.`,
		);
	}

	return alerts;
}
