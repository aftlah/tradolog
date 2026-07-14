/**
 * SharingService — mentor mode invite / accept / revoke + read-only journal view.
 * UI → SharingService → JournalShareRepository / TradeService / TradingAccountService → DB
 */
import { randomBytes } from 'node:crypto';
import { ForbiddenError, NotFoundError, ValidationError } from '@shared/lib/errors';
import { parseOrThrow } from '@shared/lib/validation';
import { journalShareInsertSchema } from '@shared/validators';
import { journalShareRepository, type TradeClosedMetrics, type TradeRecentSummary } from '@shared/repositories';
import {
	tradeService,
	tradingAccountService,
	tradingCalculatorService,
	toFiniteNumber,
	type ClosedTradeResult,
} from '@shared/services';
import { toAccountOption } from '@shared/utils/account-option';
import type { JournalShare } from '@shared/types';
import { inviteMentorFormSchema } from '../validators/sharing-schemas';
import { RECENT_SHARED_TRADES_LIMIT } from '../constants/sharing.constants';
import { inviteAcceptPath } from '../utils/invite-url';
import type {
	JournalShareDto,
	SharedJournalTradeDto,
	SharedJournalViewDto,
	SharingPageData,
} from '../types/sharing.types';

function createInviteToken(): string {
	return randomBytes(24).toString('hex');
}

function toClosedTradeResult(row: TradeClosedMetrics): ClosedTradeResult | null {
	if (row.profitLoss === null || row.closedAt === null) {
		return null;
	}
	return {
		profitLoss: row.profitLoss,
		closedAt: row.closedAt,
		plannedRR: row.plannedRr,
		actualRR: row.actualRr,
		holdingTimeSeconds: row.holdingTimeSeconds,
	};
}

function toFiniteNumberOrNull(value: string | null): number | null {
	if (value === null) {
		return null;
	}
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function toRecentTradeDto(row: TradeRecentSummary): SharedJournalTradeDto {
	return {
		id: row.id,
		symbol: row.symbolTicker ?? 'Unknown',
		side: row.side,
		status: row.status,
		result: row.result,
		strategy: row.strategyName,
		profitLoss: toFiniteNumberOrNull(row.profitLoss),
		profitLossPercent: toFiniteNumberOrNull(row.profitLossPercent),
		actualRR: toFiniteNumberOrNull(row.actualRr),
		openedAt: row.openedAt ? row.openedAt.toISOString() : null,
		closedAt: row.closedAt ? row.closedAt.toISOString() : null,
	};
}

export class SharingService {
	private async toDto(
		share: JournalShare,
		viewerUserId: string,
		owner?: { name: string; email: string } | null,
		mentor?: { name: string; email: string } | null,
	): Promise<JournalShareDto> {
		const [resolvedOwner, resolvedMentor] = await Promise.all([
			owner
				? Promise.resolve(owner)
				: journalShareRepository.findUserById(share.ownerUserId),
			mentor
				? Promise.resolve(mentor)
				: share.mentorUserId
					? journalShareRepository.findUserById(share.mentorUserId)
					: Promise.resolve(null),
		]);

		return {
			id: share.id,
			status: share.status,
			mentorEmail: share.mentorEmail,
			message: share.message,
			inviteToken: share.inviteToken,
			/** Path-only; UI prefixes `window.location.origin` when copying. */
			inviteUrl: inviteAcceptPath(share.inviteToken),
			ownerName: resolvedOwner?.name ?? null,
			ownerEmail: resolvedOwner?.email ?? null,
			mentorName: resolvedMentor?.name ?? null,
			acceptedAt: share.acceptedAt?.toISOString() ?? null,
			revokedAt: share.revokedAt?.toISOString() ?? null,
			createdAt: share.createdAt.toISOString(),
			isOwner: share.ownerUserId === viewerUserId,
		};
	}

	async getPageData(userId: string, userEmail: string): Promise<SharingPageData> {
		const [outgoingRows, incomingRows] = await Promise.all([
			journalShareRepository.listByOwner(userId),
			journalShareRepository.listForMentor(userId, userEmail),
		]);

		const outgoing = await Promise.all(outgoingRows.map((row) => this.toDto(row, userId)));
		const incoming = await Promise.all(
			incomingRows
				.filter((row) => row.ownerUserId !== userId)
				.map((row) => this.toDto(row, userId)),
		);

		return { outgoing, incoming };
	}

	async inviteMentor(ownerUserId: string, ownerEmail: string, input: unknown): Promise<JournalShareDto> {
		const form = parseOrThrow(inviteMentorFormSchema, input);
		const mentorEmail = form.mentorEmail.trim().toLowerCase();

		if (mentorEmail === ownerEmail.trim().toLowerCase()) {
			throw new ValidationError('You cannot invite yourself as a mentor.');
		}

		const existing = await journalShareRepository.findActiveForOwnerAndEmail(ownerUserId, mentorEmail);
		if (existing) {
			throw new ValidationError('An invite for this email is already pending or active.');
		}

		const mentorUser = await journalShareRepository.findUserByEmail(mentorEmail);
		const data = parseOrThrow(journalShareInsertSchema, {
			ownerUserId,
			mentorUserId: mentorUser?.id ?? null,
			mentorEmail,
			inviteToken: createInviteToken(),
			status: 'pending',
			message: form.message?.trim() ? form.message.trim() : null,
		});

		const created = await journalShareRepository.insert(data);
		return this.toDto(created, ownerUserId, null, mentorUser);
	}

	async acceptInvite(mentorUserId: string, mentorEmail: string, shareIdOrToken: { id?: string; token?: string }): Promise<JournalShareDto> {
		const share = shareIdOrToken.token
			? await journalShareRepository.findByInviteToken(shareIdOrToken.token)
			: shareIdOrToken.id
				? await journalShareRepository.findById(shareIdOrToken.id)
				: null;

		if (!share) {
			throw new NotFoundError('Invite not found.');
		}
		if (share.status === 'revoked') {
			throw new ValidationError('This invite was revoked.');
		}
		if (share.status === 'active' && share.mentorUserId === mentorUserId) {
			return this.toDto(share, mentorUserId);
		}
		if (share.ownerUserId === mentorUserId) {
			throw new ValidationError('You cannot accept your own invite.');
		}

		const normalized = mentorEmail.trim().toLowerCase();
		if (share.mentorEmail !== normalized) {
			throw new ForbiddenError('This invite was sent to a different email address.');
		}

		const updated = await journalShareRepository.updateById(share.id, {
			mentorUserId,
			status: 'active',
			acceptedAt: new Date(),
			revokedAt: null,
		});
		if (!updated) {
			throw new NotFoundError('Invite not found.');
		}
		return this.toDto(updated, mentorUserId);
	}

	async revokeShare(ownerUserId: string, shareId: string): Promise<void> {
		const share = await journalShareRepository.findById(shareId);
		if (!share || share.ownerUserId !== ownerUserId) {
			throw new NotFoundError('Share not found.');
		}
		const updated = await journalShareRepository.updateById(shareId, {
			status: 'revoked',
			revokedAt: new Date(),
		});
		if (!updated) {
			throw new NotFoundError('Share not found.');
		}
	}

	async leaveShare(mentorUserId: string, mentorEmail: string, shareId: string): Promise<void> {
		const share = await journalShareRepository.findById(shareId);
		if (!share) {
			throw new NotFoundError('Share not found.');
		}
		const isMentor =
			share.mentorUserId === mentorUserId || share.mentorEmail === mentorEmail.trim().toLowerCase();
		if (!isMentor) {
			throw new ForbiddenError('Only the mentor can leave this share.');
		}
		await journalShareRepository.updateById(shareId, {
			status: 'revoked',
			revokedAt: new Date(),
		});
	}

	/** Ensures the viewer is an active mentor on this share; returns the share row. */
	async requireActiveMentorAccess(shareId: string, mentorUserId: string, mentorEmail: string): Promise<JournalShare> {
		const share = await journalShareRepository.findById(shareId);
		if (!share || share.status !== 'active') {
			throw new NotFoundError('Shared journal not found.');
		}
		const allowed =
			share.mentorUserId === mentorUserId || share.mentorEmail === mentorEmail.trim().toLowerCase();
		if (!allowed) {
			throw new ForbiddenError('You do not have access to this journal.');
		}
		return share;
	}

	async getSharedJournalView(
		shareId: string,
		mentorUserId: string,
		mentorEmail: string,
		accountIdHint?: string | null,
	): Promise<SharedJournalViewDto> {
		const share = await this.requireActiveMentorAccess(shareId, mentorUserId, mentorEmail);
		const ownerId = share.ownerUserId;

		const accounts = await tradingAccountService.list(ownerId);
		const accountOptions = accounts.map(toAccountOption);
		const activeAccount =
			(accountIdHint ? accounts.find((account) => account.id === accountIdHint) : undefined) ??
			accounts.find((account) => account.isDefault) ??
			accounts[0] ??
			null;

		const shareDto = await this.toDto(share, mentorUserId);

		if (!activeAccount) {
			return {
				share: shareDto,
				accounts: accountOptions,
				activeAccountId: null,
				currency: 'USD',
				startingBalance: 0,
				currentBalance: 0,
				performance: tradingCalculatorService.performanceSummary([]),
				recentTrades: [],
			};
		}

		const [closedMetrics, recent] = await Promise.all([
			tradeService.listClosedMetricsByAccount(ownerId, activeAccount.id),
			tradeService.listRecentSummariesByAccount(ownerId, activeAccount.id, RECENT_SHARED_TRADES_LIMIT),
		]);

		const closedResults = closedMetrics
			.map(toClosedTradeResult)
			.filter((result): result is ClosedTradeResult => result !== null);

		return {
			share: shareDto,
			accounts: accountOptions,
			activeAccountId: activeAccount.id,
			currency: activeAccount.currency,
			startingBalance: toFiniteNumber(activeAccount.startingBalance),
			currentBalance: toFiniteNumber(activeAccount.currentBalance),
			performance: tradingCalculatorService.performanceSummary(closedResults),
			recentTrades: recent.map(toRecentTradeDto),
		};
	}
}

export const sharingService = new SharingService();
