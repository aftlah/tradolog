import { NotFoundError } from '@shared/lib/errors';
import { parseOrThrow } from '@shared/lib/validation';
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
	async list(userId: string) {
		return tradingAccountRepository.listByUserId(userId);
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
		return tradingAccountRepository.insert(data);
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
