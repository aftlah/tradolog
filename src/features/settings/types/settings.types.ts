import type { AccountOption, AccountType, MarketType } from '@shared/types';
import type { RiskRulesDto } from '@features/risk/types/risk.types';
import type { JournalShareDto } from '@features/sharing/types/sharing.types';

/** Serializable trader-preferences DTO rendered by `ProfileSettingsForm`. */
export interface ProfileSettingsDto {
	displayName: string | null;
	timezone: string;
	baseCurrency: string;
	riskPerTradePercent: number | null;
	defaultRiskReward: number | null;
	bio: string | null;
}

/** `AccountOption` plus the extra fields the Settings edit dialog needs (leverage, notes). */
export interface AccountSettingsDto extends AccountOption {
	leverage: number | null;
	notes: string | null;
	createdAt: string;
}

export interface StrategySettingsDto {
	id: string;
	name: string;
	description: string | null;
	rules: string | null;
	color: string | null;
	isActive: boolean;
	createdAt: string;
}

export interface SymbolSettingsDto {
	id: string;
	ticker: string;
	name: string;
	marketType: MarketType;
	baseAsset: string | null;
	quoteAsset: string | null;
	pipSize: number | null;
	contractSize: number | null;
	pricePrecision: number;
	isActive: boolean;
	/** True when `userId` matches the viewer — only user-owned symbols may be edited/deleted. */
	isOwnedByUser: boolean;
	createdAt: string;
}

/** Full, ready-to-render payload for `/app/settings`. */
export interface SettingsPageData {
	profile: ProfileSettingsDto;
	accounts: AccountSettingsDto[];
	strategies: StrategySettingsDto[];
	symbols: SymbolSettingsDto[];
	riskRules: RiskRulesDto;
	outgoingShares: JournalShareDto[];
}

export type { AccountType, MarketType };
