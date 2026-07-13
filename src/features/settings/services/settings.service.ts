/**
 * SettingsService
 *
 * Composes the profile/trading-account/strategy/symbol repositories to power the Settings
 * feature. Every mutation is re-validated here against the shared domain validators (never
 * trust client data), and only serializable DTOs cross the Service → UI boundary.
 *
 * UI → SettingsService → (ProfileRepository / TradingAccountRepository / StrategyRepository / SymbolRepository) → Database
 */
import { NotFoundError, ValidationError } from '@shared/lib/errors';
import { parseOrThrow } from '@shared/lib/validation';
import {
	profileRepository,
	strategyRepository,
	symbolRepository,
	tradingAccountRepository,
} from '@shared/repositories';
import {
	profileInsertSchema,
	profileUpdateSchema,
	strategyInsertSchema,
	strategyUpdateSchema,
	symbolInsertSchema,
	symbolUpdateSchema,
	tradingAccountInsertSchema,
	tradingAccountUpdateSchema,
} from '@shared/validators';
import { toNullableNumber, tradingAccountService } from '@shared/services';
import { toAccountOption } from '@shared/utils/account-option';
import type { Profile, Strategy, TradeSymbol, TradingAccount } from '@shared/types';
import type {
	AccountSettingsDto,
	ProfileSettingsDto,
	SettingsPageData,
	StrategySettingsDto,
	SymbolSettingsDto,
} from '../types/settings.types';

function withUserId(input: unknown, userId: string): Record<string, unknown> {
	if (typeof input !== 'object' || input === null || Array.isArray(input)) {
		throw new ValidationError('Invalid request body.');
	}
	return { ...(input as Record<string, unknown>), userId };
}

function toProfileDto(profile: Profile): ProfileSettingsDto {
	return {
		displayName: profile.displayName,
		timezone: profile.timezone,
		baseCurrency: profile.baseCurrency,
		riskPerTradePercent: toNullableNumber(profile.riskPerTradePercent),
		defaultRiskReward: toNullableNumber(profile.defaultRiskReward),
		bio: profile.bio,
	};
}

function toAccountDto(account: TradingAccount): AccountSettingsDto {
	return {
		...toAccountOption(account),
		leverage: account.leverage,
		notes: account.notes,
		createdAt: account.createdAt.toISOString(),
	};
}

function toStrategyDto(strategy: Strategy): StrategySettingsDto {
	return {
		id: strategy.id,
		name: strategy.name,
		description: strategy.description,
		rules: strategy.rules,
		color: strategy.color,
		isActive: strategy.isActive,
		createdAt: strategy.createdAt.toISOString(),
	};
}

function toSymbolDto(symbol: TradeSymbol, userId: string): SymbolSettingsDto {
	return {
		id: symbol.id,
		ticker: symbol.ticker,
		name: symbol.name,
		marketType: symbol.marketType,
		baseAsset: symbol.baseAsset,
		quoteAsset: symbol.quoteAsset,
		pipSize: toNullableNumber(symbol.pipSize),
		pricePrecision: symbol.pricePrecision,
		isActive: symbol.isActive,
		isOwnedByUser: symbol.userId === userId,
		createdAt: symbol.createdAt.toISOString(),
	};
}

/** Unsets `isDefault` on every other account owned by `userId` so exactly one stays default. */
async function clearOtherDefaultAccounts(userId: string, keepAccountId: string): Promise<void> {
	const accounts = await tradingAccountRepository.listByUserId(userId);
	await Promise.all(
		accounts
			.filter((account) => account.id !== keepAccountId && account.isDefault)
			.map((account) => tradingAccountRepository.updateForUser(account.id, userId, { isDefault: false })),
	);
}

export class SettingsService {
	async getSettingsPageData(userId: string): Promise<SettingsPageData> {
		const [profile, accounts, strategies, symbols] = await Promise.all([
			this.getOrCreateProfile(userId),
			tradingAccountService.list(userId),
			strategyRepository.listByUserId(userId),
			symbolRepository.listForUser(userId),
		]);

		return {
			profile: toProfileDto(profile),
			accounts: accounts.map(toAccountDto),
			strategies: strategies.map(toStrategyDto),
			symbols: symbols.map((symbol) => toSymbolDto(symbol, userId)),
		};
	}

	private async getOrCreateProfile(userId: string): Promise<Profile> {
		const existing = await profileRepository.findByUserId(userId);
		if (existing) {
			return existing;
		}
		const data = parseOrThrow(profileInsertSchema, { userId });
		return profileRepository.insert(data);
	}

	async updateProfile(userId: string, input: unknown): Promise<ProfileSettingsDto> {
		await this.getOrCreateProfile(userId);
		const data = parseOrThrow(profileUpdateSchema, input);
		const updated = await profileRepository.updateByUserId(userId, data);
		if (!updated) {
			throw new NotFoundError('Profile not found.');
		}
		return toProfileDto(updated);
	}

	async createAccount(userId: string, input: unknown): Promise<AccountSettingsDto> {
		const data = parseOrThrow(tradingAccountInsertSchema, withUserId(input, userId));
		const existingAccounts = await tradingAccountRepository.listByUserId(userId);
		const shouldBeDefault = data.isDefault || existingAccounts.length === 0;
		const startingBalance = data.startingBalance ?? '0';

		const account = await tradingAccountRepository.insert({
			...data,
			startingBalance,
			currentBalance: startingBalance,
			isDefault: shouldBeDefault,
		});

		if (shouldBeDefault) {
			await clearOtherDefaultAccounts(userId, account.id);
		}

		return toAccountDto(account);
	}

	async updateAccount(id: string, userId: string, input: unknown): Promise<AccountSettingsDto> {
		const existing = await tradingAccountRepository.findByIdForUser(id, userId);
		if (!existing) {
			throw new NotFoundError('Trading account not found.');
		}

		const data = parseOrThrow(tradingAccountUpdateSchema, input);
		const { currentBalance: _ignoredCurrentBalance, ...safeData } = data;
		const updated = await tradingAccountRepository.updateForUser(id, userId, safeData);
		if (!updated) {
			throw new NotFoundError('Trading account not found.');
		}

		if (data.isDefault) {
			await clearOtherDefaultAccounts(userId, id);
		}

		const synced = await tradingAccountService.syncCurrentBalance(userId, id);
		return toAccountDto(synced);
	}

	async deleteAccount(id: string, userId: string): Promise<void> {
		const deleted = await tradingAccountRepository.softDeleteForUser(id, userId);
		if (!deleted) {
			throw new NotFoundError('Trading account not found.');
		}
	}

	async createStrategy(userId: string, input: unknown): Promise<StrategySettingsDto> {
		const data = parseOrThrow(strategyInsertSchema, withUserId(input, userId));
		const strategy = await strategyRepository.insert(data);
		return toStrategyDto(strategy);
	}

	async updateStrategy(id: string, userId: string, input: unknown): Promise<StrategySettingsDto> {
		const existing = await strategyRepository.findByIdForUser(id, userId);
		if (!existing) {
			throw new NotFoundError('Strategy not found.');
		}

		const data = parseOrThrow(strategyUpdateSchema, input);
		const updated = await strategyRepository.updateForUser(id, userId, data);
		if (!updated) {
			throw new NotFoundError('Strategy not found.');
		}
		return toStrategyDto(updated);
	}

	async deleteStrategy(id: string, userId: string): Promise<void> {
		const deleted = await strategyRepository.softDeleteForUser(id, userId);
		if (!deleted) {
			throw new NotFoundError('Strategy not found.');
		}
	}

	async createSymbol(userId: string, input: unknown): Promise<SymbolSettingsDto> {
		const data = parseOrThrow(symbolInsertSchema, withUserId(input, userId));
		const symbol = await symbolRepository.insert(data);
		return toSymbolDto(symbol, userId);
	}

	/** Only ever mutates symbols owned by `userId` — the shared/system catalog is read-only here. */
	async updateSymbol(id: string, userId: string, input: unknown): Promise<SymbolSettingsDto> {
		const existing = await symbolRepository.findById(id);
		if (!existing || existing.userId !== userId) {
			throw new NotFoundError('Symbol not found.');
		}

		const data = parseOrThrow(symbolUpdateSchema, input);
		const updated = await symbolRepository.updateForUser(id, userId, data);
		if (!updated) {
			throw new NotFoundError('Symbol not found.');
		}
		return toSymbolDto(updated, userId);
	}

	async deleteSymbol(id: string, userId: string): Promise<void> {
		const existing = await symbolRepository.findById(id);
		if (!existing || existing.userId !== userId) {
			throw new NotFoundError('Symbol not found.');
		}

		const deleted = await symbolRepository.softDeleteForUser(id, userId);
		if (!deleted) {
			throw new NotFoundError('Symbol not found.');
		}
	}
}

export const settingsService = new SettingsService();
