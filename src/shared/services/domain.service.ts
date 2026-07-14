import { NotFoundError } from '@shared/lib/errors';
import { parseOrThrow } from '@shared/lib/validation';
import { accountsCacheKey, cacheGet, cacheSet } from '@shared/lib/cache/page-data-cache';
import { reviveTradingAccounts } from '@shared/utils/revive-trading-account';
import {
	monthlyGoalRepository,
	profileRepository,
	strategyRepository,
	symbolRepository,
	tradeImageRepository,
	tradeNoteRepository,
	tradeRepository,
	tradeReviewRepository,
	tradingAccountRepository,
	watchlistRepository,
} from '@shared/repositories';
import {
	monthlyGoalInsertSchema,
	profileInsertSchema,
	profileUpdateSchema,
	strategyInsertSchema,
	symbolInsertSchema,
	tradeImageInsertSchema,
	tradeInsertSchema,
	tradeNoteInsertSchema,
	tradeReviewInsertSchema,
	tradingAccountInsertSchema,
	watchlistInsertSchema,
	type MonthlyGoalInsertInput,
	type ProfileInsertInput,
	type StrategyInsertInput,
	type SymbolInsertInput,
	type TradeImageInsertInput,
	type TradeInsertInput,
	type TradeNoteInsertInput,
	type TradeReviewInsertInput,
	type TradingAccountInsertInput,
	type WatchlistInsertInput,
} from '@shared/validators';
import { computeCurrentBalance } from './account-balance';

export class ProfileService {
	async getByUserId(userId: string) {
		return profileRepository.findByUserId(userId);
	}

	async requireByUserId(userId: string) {
		const profile = await profileRepository.findByUserId(userId);
		if (!profile) {
			throw new NotFoundError('Profile not found.');
		}
		return profile;
	}

	async create(input: ProfileInsertInput) {
		const data = parseOrThrow(profileInsertSchema, input);
		return profileRepository.insert(data);
	}

	async update(userId: string, input: unknown) {
		const data = parseOrThrow(profileUpdateSchema, input);
		const updated = await profileRepository.updateByUserId(userId, data);
		if (!updated) {
			throw new NotFoundError('Profile not found.');
		}
		return updated;
	}
}

export class TradingAccountService {
	/** Returns accounts as stored. `currentBalance` is kept in sync on trade mutations. */
	async list(userId: string) {
		const cacheKey = accountsCacheKey(userId);
		const cached = await cacheGet<Awaited<ReturnType<typeof tradingAccountRepository.listByUserId>>>(cacheKey);
		if (cached) {
			return reviveTradingAccounts(cached);
		}
		const accounts = await tradingAccountRepository.listByUserId(userId);
		await cacheSet(cacheKey, accounts);
		return accounts;
	}

	async requireForUser(id: string, userId: string) {
		const account = await tradingAccountRepository.findByIdForUser(id, userId);
		if (!account) {
			throw new NotFoundError('Trading account not found.');
		}
		return account;
	}

	async create(input: TradingAccountInsertInput) {
		const data = parseOrThrow(tradingAccountInsertSchema, input);
		const startingBalance = data.startingBalance ?? '0';
		return tradingAccountRepository.insert({
			...data,
			startingBalance,
			currentBalance: startingBalance,
		});
	}

	/**
	 * Sets `currentBalance` = starting balance + SUM(closed P&L) via SQL (no full trade scan).
	 * Call after trade create/update/delete and when starting balance changes.
	 */
	async syncCurrentBalance(userId: string, accountId: string) {
		const account = await this.requireForUser(accountId, userId);
		const closedPnl = await tradeRepository.sumClosedProfitLoss(userId, accountId);
		const currentBalance = computeCurrentBalance(account.startingBalance, [closedPnl]);
		const updated = await tradingAccountRepository.updateForUser(accountId, userId, {
			currentBalance: String(currentBalance),
		});
		return updated ?? account;
	}

	/** Refresh every account balance with one grouped SUM query. */
	async syncAllCurrentBalances(userId: string) {
		const accounts = await tradingAccountRepository.listByUserId(userId);
		if (accounts.length === 0) {
			return accounts;
		}

		const pnlByAccount = await tradeRepository.sumClosedProfitLossByAccount(userId);
		await Promise.all(
			accounts.map((account) => {
				const currentBalance = computeCurrentBalance(account.startingBalance, [
					pnlByAccount.get(account.id) ?? 0,
				]);
				return tradingAccountRepository.updateForUser(account.id, userId, {
					currentBalance: String(currentBalance),
				});
			}),
		);

		return tradingAccountRepository.listByUserId(userId);
	}
}

export class SymbolService {
	async listForUser(userId: string) {
		return symbolRepository.listForUser(userId);
	}

	async create(input: SymbolInsertInput) {
		const data = parseOrThrow(symbolInsertSchema, input);
		return symbolRepository.insert(data);
	}
}

export class StrategyService {
	async list(userId: string) {
		return strategyRepository.listByUserId(userId);
	}

	async create(input: StrategyInsertInput) {
		const data = parseOrThrow(strategyInsertSchema, input);
		return strategyRepository.insert(data);
	}
}

export class TradeService {
	async list(userId: string) {
		return tradeRepository.listByUserId(userId);
	}

	async listByAccount(userId: string, accountId: string) {
		return tradeRepository.listByAccountId(userId, accountId);
	}

	async listClosedMetricsByAccount(userId: string, accountId: string) {
		return tradeRepository.listClosedMetricsByAccount(userId, accountId);
	}

	async listRecentSummariesByAccount(userId: string, accountId: string, limit: number) {
		return tradeRepository.listRecentSummariesByAccount(userId, accountId, limit);
	}

	async listClosedSummariesInRange(userId: string, accountId: string, rangeStart: Date, rangeEnd: Date) {
		return tradeRepository.listClosedSummariesInRange(userId, accountId, rangeStart, rangeEnd);
	}

	async requireForUser(id: string, userId: string) {
		const trade = await tradeRepository.findByIdForUser(id, userId);
		if (!trade) {
			throw new NotFoundError('Trade not found.');
		}
		return trade;
	}

	async create(input: TradeInsertInput) {
		const data = parseOrThrow(tradeInsertSchema, input);
		return tradeRepository.insert(data);
	}
}

export class TradeDetailsService {
	async listImages(tradeId: string, userId: string) {
		return tradeImageRepository.listByTradeId(tradeId, userId);
	}

	async addImage(input: TradeImageInsertInput) {
		const data = parseOrThrow(tradeImageInsertSchema, input);
		return tradeImageRepository.insert(data);
	}

	async listNotes(tradeId: string, userId: string) {
		return tradeNoteRepository.listByTradeId(tradeId, userId);
	}

	async addNote(input: TradeNoteInsertInput) {
		const data = parseOrThrow(tradeNoteInsertSchema, input);
		return tradeNoteRepository.insert(data);
	}

	async getReview(tradeId: string, userId: string) {
		return tradeReviewRepository.findByTradeId(tradeId, userId);
	}

	async addReview(input: TradeReviewInsertInput) {
		const data = parseOrThrow(tradeReviewInsertSchema, input);
		return tradeReviewRepository.insert(data);
	}
}

export class MonthlyGoalService {
	async list(userId: string) {
		return monthlyGoalRepository.listByUserId(userId);
	}

	async create(input: MonthlyGoalInsertInput) {
		const data = parseOrThrow(monthlyGoalInsertSchema, input);
		return monthlyGoalRepository.insert(data);
	}
}

export class WatchlistService {
	async list(userId: string) {
		return watchlistRepository.listByUserId(userId);
	}

	async create(input: WatchlistInsertInput) {
		const data = parseOrThrow(watchlistInsertSchema, input);
		return watchlistRepository.insert(data);
	}
}

export const profileService = new ProfileService();
export const tradingAccountService = new TradingAccountService();
export const symbolService = new SymbolService();
export const strategyService = new StrategyService();
export const tradeService = new TradeService();
export const tradeDetailsService = new TradeDetailsService();
export const monthlyGoalService = new MonthlyGoalService();
export const watchlistService = new WatchlistService();
