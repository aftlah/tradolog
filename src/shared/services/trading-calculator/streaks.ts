/**
 * Win/loss streak formulas.
 *
 * Trades are ordered chronologically by `closedAt` before streaks are computed. A breakeven
 * trade resets both the running win streak and the running loss streak to `0` — it is treated
 * as neither a continuation nor an extension of either streak.
 *
 * Trades with no `closedAt` cannot be placed on the timeline and are ignored.
 */
import { classifyTradeOutcome } from './performance-metrics';
import type { ClosedTradeResult, StreakSummary, TradeOutcome } from './types';
import { toFiniteNumber, toNullableDate } from './utils';

interface OrderedOutcome {
	outcome: TradeOutcome;
	closedAt: Date;
}

function toOrderedOutcomes(trades: readonly ClosedTradeResult[]): OrderedOutcome[] {
	return trades
		.map((trade) => ({
			outcome: classifyTradeOutcome(toFiniteNumber(trade.profitLoss)),
			closedAt: toNullableDate(trade.closedAt),
		}))
		.filter((trade): trade is OrderedOutcome => trade.closedAt !== null)
		.sort((a, b) => a.closedAt.getTime() - b.closedAt.getTime());
}

/**
 * Current Win/Loss Streak = the number of consecutive wins (or losses) ending at the most
 * recently closed trade.
 *
 * Maximum Win/Loss Streak = the longest run of consecutive wins (or losses) observed anywhere
 * in the trade history.
 */
export function calculateStreaks(trades: readonly ClosedTradeResult[]): StreakSummary {
	const ordered = toOrderedOutcomes(trades);

	let runningWinStreak = 0;
	let runningLossStreak = 0;
	let maxWinStreak = 0;
	let maxLossStreak = 0;

	for (const trade of ordered) {
		if (trade.outcome === 'win') {
			runningWinStreak += 1;
			runningLossStreak = 0;
		} else if (trade.outcome === 'loss') {
			runningLossStreak += 1;
			runningWinStreak = 0;
		} else {
			runningWinStreak = 0;
			runningLossStreak = 0;
		}
		maxWinStreak = Math.max(maxWinStreak, runningWinStreak);
		maxLossStreak = Math.max(maxLossStreak, runningLossStreak);
	}

	// The running counters, after the final iteration, already represent the streak ending at
	// the most recently closed trade — no second pass needed.
	return {
		currentWinStreak: runningWinStreak,
		currentLossStreak: runningLossStreak,
		maxWinStreak,
		maxLossStreak,
	};
}
