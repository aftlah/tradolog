import type { PerformanceSummary } from '@shared/services';
import type { AccountOption, ShareStatus } from '@shared/types';

export interface JournalShareDto {
	id: string;
	status: ShareStatus;
	mentorEmail: string;
	message: string | null;
	inviteToken: string;
	/** Relative path `/app/shared/accept?token=…` — UI prefixes current origin when copying. */
	inviteUrl: string;
	ownerName: string | null;
	ownerEmail: string | null;
	mentorName: string | null;
	acceptedAt: string | null;
	revokedAt: string | null;
	createdAt: string;
	/** True when the current viewer is the journal owner. */
	isOwner: boolean;
}

export interface SharedJournalTradeDto {
	id: string;
	symbol: string;
	side: string;
	status: string;
	result: string | null;
	strategy: string | null;
	profitLoss: number | null;
	profitLossPercent: number | null;
	actualRR: number | null;
	openedAt: string | null;
	closedAt: string | null;
}

export interface SharedJournalViewDto {
	share: JournalShareDto;
	accounts: AccountOption[];
	activeAccountId: string | null;
	currency: string;
	startingBalance: number;
	currentBalance: number;
	performance: PerformanceSummary;
	recentTrades: SharedJournalTradeDto[];
}

export interface SharingPageData {
	outgoing: JournalShareDto[];
	incoming: JournalShareDto[];
}
