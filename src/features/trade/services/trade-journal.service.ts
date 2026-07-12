/**
 * TradeJournalService
 *
 * Composes the trade/symbol/strategy/account repositories with `TradingCalculatorService` and
 * R2 storage to implement the full Trade CRUD flow. Every derived metric (risk, reward, RR,
 * P&L, pips, holding time, and the win/loss/breakeven result) is computed here from raw price
 * inputs — the UI only ever sends prices/quantities/dates, never a calculated number, and it
 * never receives a hand-picked `result`.
 *
 * UI → TradeJournalService → (TradeRepository / SymbolRepository / …) + TradingCalculatorService + R2 → Database/Storage
 */
import { randomUUID } from 'node:crypto';
import { NotFoundError, ValidationError } from '@shared/lib/errors';
import { parseOrThrow } from '@shared/lib/validation';
import { deleteTradeScreenshot, uploadTradeScreenshot } from '@shared/lib/r2';
import {
	strategyRepository,
	symbolRepository,
	tradeImageRepository,
	tradeNoteRepository,
	tradeRepository,
	tradingAccountRepository,
	type TradeListQuery as RepositoryTradeListQuery,
} from '@shared/repositories';
import { tradeDetailsService, tradingAccountService, tradingCalculatorService } from '@shared/services';
import { toAccountOption } from '@shared/utils/account-option';
import type {
	Strategy,
	Trade,
	TradeImage,
	TradeNote,
	TradeSymbol,
	TradingAccount,
} from '@shared/types';
import {
	ALLOWED_IMAGE_MIME_TYPES,
	MAX_IMAGES_PER_TRADE,
	MAX_IMAGE_SIZE_BYTES,
	XAUUSD_CONTRACT_SIZE,
	XAUUSD_TICKER,
} from '../constants/trade.constants';
import { tradeFormSchema, tradeNoteFormSchema, type TradeFormValues } from '../validators/trade-schemas';
import type {
	PaginatedResult,
	TradeDetail,
	TradeFormOptions,
	TradeImageDto,
	TradeListItem,
	TradeListQuery,
	TradeNoteDto,
} from '../types/trade.types';

function toNumberOrNull(value: string | null): number | null {
	if (value === null) {
		return null;
	}
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : null;
}

/** XAUUSD uses 100 oz per lot; other symbols stay at 1 until their contract size is configured. */
function resolveContractSize(symbol: TradeSymbol): number {
	const stored = toNumberOrNull(symbol.contractSize);
	if (stored !== null && stored > 0) {
		return stored;
	}
	return symbol.ticker === XAUUSD_TICKER ? XAUUSD_CONTRACT_SIZE : 1;
}

function toIsoOrNull(value: Date | null): string | null {
	return value ? value.toISOString() : null;
}

function toImageDto(image: TradeImage): TradeImageDto {
	return {
		id: image.id,
		url: image.url,
		caption: image.caption,
		isPrimary: image.isPrimary,
		sortOrder: image.sortOrder,
		createdAt: image.createdAt.toISOString(),
	};
}

function toNoteDto(note: TradeNote): TradeNoteDto {
	return {
		id: note.id,
		title: note.title,
		body: note.body,
		isPinned: note.isPinned,
		createdAt: note.createdAt.toISOString(),
	};
}

function buildTradeDetail(
	trade: Trade,
	symbol: TradeSymbol | null,
	strategy: Strategy | null,
	account: TradingAccount | null,
	images: TradeImage[],
	notes: TradeNote[],
): TradeDetail {
	return {
		id: trade.id,
		accountId: trade.accountId,
		accountName: account?.name ?? 'Unknown',
		currency: account?.currency ?? 'USD',
		symbolId: trade.symbolId,
		symbol: symbol?.ticker ?? 'Unknown',
		strategyId: trade.strategyId,
		strategy: strategy?.name ?? null,
		side: trade.side,
		status: trade.status,
		result: trade.result,
		session: trade.session,
		entryPrice: toNumberOrNull(trade.entryPrice),
		exitPrice: toNumberOrNull(trade.exitPrice),
		quantity: toNumberOrNull(trade.quantity),
		profitLoss: toNumberOrNull(trade.profitLoss),
		profitLossPercent: toNumberOrNull(trade.profitLossPercent),
		actualRR: toNumberOrNull(trade.actualRr),
		plannedRR: toNumberOrNull(trade.plannedRr),
		pips: toNumberOrNull(trade.pips),
		openedAt: toIsoOrNull(trade.openedAt),
		closedAt: toIsoOrNull(trade.closedAt),
		stopLoss: toNumberOrNull(trade.stopLoss),
		takeProfit: toNumberOrNull(trade.takeProfit),
		riskAmount: toNumberOrNull(trade.riskAmount),
		rewardAmount: toNumberOrNull(trade.rewardAmount),
		profitPerLot: tradingCalculatorService.profitPerLot(toNumberOrNull(trade.profitLoss), trade.quantity),
		quoteToAccountRate: account ? toNumberOrNull(account.quoteToAccountRate) : null,
		fees: toNumberOrNull(trade.fees),
		holdingTimeSeconds: toNumberOrNull(trade.holdingTimeSeconds),
		setup: trade.setup,
		mistakes: trade.mistakes,
		lessons: trade.lessons,
		tags: trade.tags,
		createdAt: trade.createdAt.toISOString(),
		updatedAt: trade.updatedAt.toISOString(),
		images: images.map(toImageDto),
		notes: notes.map(toNoteDto),
	};
}

function toRepositoryQuery(userId: string, query: TradeListQuery): { userId: string; query: RepositoryTradeListQuery } {
	const page = Math.max(1, query.page);
	const pageSize = Math.min(100, Math.max(1, query.pageSize));

	return {
		userId,
		query: {
			page,
			pageSize,
			sortBy: query.sortBy,
			sortDir: query.sortDir,
			search: query.search,
			accountId: query.accountId,
			symbolId: query.symbolId,
			strategyId: query.strategyId,
			side: query.side,
			status: query.status,
			result: query.result,
			session: query.session,
			dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
			dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
		},
	};
}

async function assertOwnedReferences(
	userId: string,
	data: Pick<TradeFormValues, 'accountId' | 'symbolId' | 'strategyId'>,
): Promise<{ symbol: TradeSymbol; account: TradingAccount }> {
	const account = await tradingAccountRepository.findByIdForUser(data.accountId, userId);
	if (!account) {
		throw new NotFoundError('Trading account not found.');
	}

	const symbol = await symbolRepository.findById(data.symbolId);
	if (!symbol) {
		throw new NotFoundError('Symbol not found.');
	}

	if (data.strategyId) {
		const strategy = await strategyRepository.findByIdForUser(data.strategyId, userId);
		if (!strategy) {
			throw new NotFoundError('Strategy not found.');
		}
	}

	return { symbol, account };
}

function resolveFxRate(account: TradingAccount): number {
	const rate = toNumberOrNull(account.quoteToAccountRate);
	return rate !== null && rate > 0 ? rate : 1;
}

export class TradeJournalService {
	async listPaginated(userId: string, query: TradeListQuery): Promise<PaginatedResult<TradeListItem>> {
		const { query: repoQuery } = toRepositoryQuery(userId, query);
		const { rows, total } = await tradeRepository.listPaginated(userId, repoQuery);

		const items: TradeListItem[] = rows.map(({ trade, symbolTicker, strategyName, accountName, accountCurrency }) => ({
			id: trade.id,
			accountId: trade.accountId,
			accountName: accountName ?? 'Unknown',
			currency: accountCurrency ?? 'USD',
			symbolId: trade.symbolId,
			symbol: symbolTicker ?? 'Unknown',
			strategyId: trade.strategyId,
			strategy: strategyName ?? null,
			side: trade.side,
			status: trade.status,
			result: trade.result,
			session: trade.session,
			entryPrice: toNumberOrNull(trade.entryPrice),
			exitPrice: toNumberOrNull(trade.exitPrice),
			quantity: toNumberOrNull(trade.quantity),
			profitLoss: toNumberOrNull(trade.profitLoss),
			profitLossPercent: toNumberOrNull(trade.profitLossPercent),
			actualRR: toNumberOrNull(trade.actualRr),
			plannedRR: toNumberOrNull(trade.plannedRr),
			pips: toNumberOrNull(trade.pips),
			openedAt: toIsoOrNull(trade.openedAt),
			closedAt: toIsoOrNull(trade.closedAt),
		}));

		return {
			items,
			page: repoQuery.page,
			pageSize: repoQuery.pageSize,
			total,
			pageCount: Math.max(1, Math.ceil(total / repoQuery.pageSize)),
		};
	}

	async getFormOptions(userId: string): Promise<TradeFormOptions> {
		const [accounts, symbols, strategies] = await Promise.all([
			tradingAccountService.list(userId),
			symbolRepository.listForUser(userId),
			strategyRepository.listByUserId(userId),
		]);

		return {
			accounts: accounts.map(toAccountOption),
			symbols: symbols.map((symbol) => ({
				id: symbol.id,
				ticker: symbol.ticker,
				name: symbol.name,
				pipSize: toNumberOrNull(symbol.pipSize),
				pricePrecision: symbol.pricePrecision,
			})),
			strategies: strategies.map((strategy) => ({
				id: strategy.id,
				name: strategy.name,
				color: strategy.color,
			})),
		};
	}

	async getDetail(id: string, userId: string): Promise<TradeDetail> {
		const trade = await tradeRepository.findByIdForUser(id, userId);
		if (!trade) {
			throw new NotFoundError('Trade not found.');
		}

		const [symbol, strategy, account, images, notes] = await Promise.all([
			symbolRepository.findById(trade.symbolId),
			trade.strategyId ? strategyRepository.findByIdForUser(trade.strategyId, userId) : Promise.resolve(null),
			tradingAccountRepository.findByIdForUser(trade.accountId, userId),
			tradeImageRepository.listByTradeId(trade.id, userId),
			tradeNoteRepository.listByTradeId(trade.id, userId),
		]);

		return buildTradeDetail(trade, symbol, strategy, account, images, notes);
	}

	async create(userId: string, input: unknown): Promise<TradeDetail> {
		const data = parseOrThrow(tradeFormSchema, input);
		const { symbol, account } = await assertOwnedReferences(userId, data);

		const metrics = tradingCalculatorService.tradeMetrics({
			side: data.side,
			entryPrice: data.entryPrice,
			exitPrice: data.exitPrice,
			stopLoss: data.stopLoss,
			takeProfit: data.takeProfit,
			quantity: data.quantity,
			fees: data.fees ?? 0,
			pipSize: symbol.pipSize,
			contractSize: resolveContractSize(symbol),
			fxRate: resolveFxRate(account),
			openedAt: data.openedAt,
			closedAt: data.closedAt,
		});

		const result =
			data.status === 'closed' && metrics.profitLoss !== null
				? tradingCalculatorService.classifyOutcome(metrics.profitLoss)
				: null;

		const trade = await tradeRepository.insert({
			userId,
			accountId: data.accountId,
			symbolId: data.symbolId,
			strategyId: data.strategyId ?? null,
			side: data.side,
			status: data.status,
			result,
			session: data.session ?? null,
			entryPrice: String(data.entryPrice),
			exitPrice: data.exitPrice != null ? String(data.exitPrice) : null,
			stopLoss: data.stopLoss != null ? String(data.stopLoss) : null,
			takeProfit: data.takeProfit != null ? String(data.takeProfit) : null,
			quantity: String(data.quantity),
			riskAmount: metrics.riskAmount != null ? String(metrics.riskAmount) : null,
			rewardAmount: metrics.rewardAmount != null ? String(metrics.rewardAmount) : null,
			plannedRr: metrics.plannedRR != null ? String(metrics.plannedRR) : null,
			actualRr: metrics.actualRR != null ? String(metrics.actualRR) : null,
			profitLoss: metrics.profitLoss != null ? String(metrics.profitLoss) : null,
			profitLossPercent: metrics.profitLossPercent != null ? String(metrics.profitLossPercent) : null,
			pips: metrics.pips != null ? String(metrics.pips) : null,
			fees: String(data.fees ?? 0),
			openedAt: new Date(data.openedAt),
			closedAt: data.closedAt ? new Date(data.closedAt) : null,
			holdingTimeSeconds: metrics.holdingTimeSeconds != null ? String(metrics.holdingTimeSeconds) : null,
			setup: data.setup ?? null,
			mistakes: data.mistakes ?? null,
			lessons: data.lessons ?? null,
			tags: data.tags ?? null,
		});

		await tradingAccountService.syncCurrentBalance(userId, data.accountId);
		return this.getDetail(trade.id, userId);
	}

	async update(id: string, userId: string, input: unknown): Promise<TradeDetail> {
		const existing = await tradeRepository.findByIdForUser(id, userId);
		if (!existing) {
			throw new NotFoundError('Trade not found.');
		}

		const data = parseOrThrow(tradeFormSchema, input);
		const { symbol, account } = await assertOwnedReferences(userId, data);

		const metrics = tradingCalculatorService.tradeMetrics({
			side: data.side,
			entryPrice: data.entryPrice,
			exitPrice: data.exitPrice,
			stopLoss: data.stopLoss,
			takeProfit: data.takeProfit,
			quantity: data.quantity,
			fees: data.fees ?? 0,
			pipSize: symbol.pipSize,
			contractSize: resolveContractSize(symbol),
			fxRate: resolveFxRate(account),
			openedAt: data.openedAt,
			closedAt: data.closedAt,
		});

		const result =
			data.status === 'closed' && metrics.profitLoss !== null
				? tradingCalculatorService.classifyOutcome(metrics.profitLoss)
				: null;

		const updated = await tradeRepository.updateForUser(id, userId, {
			accountId: data.accountId,
			symbolId: data.symbolId,
			strategyId: data.strategyId ?? null,
			side: data.side,
			status: data.status,
			result,
			session: data.session ?? null,
			entryPrice: String(data.entryPrice),
			exitPrice: data.exitPrice != null ? String(data.exitPrice) : null,
			stopLoss: data.stopLoss != null ? String(data.stopLoss) : null,
			takeProfit: data.takeProfit != null ? String(data.takeProfit) : null,
			quantity: String(data.quantity),
			riskAmount: metrics.riskAmount != null ? String(metrics.riskAmount) : null,
			rewardAmount: metrics.rewardAmount != null ? String(metrics.rewardAmount) : null,
			plannedRr: metrics.plannedRR != null ? String(metrics.plannedRR) : null,
			actualRr: metrics.actualRR != null ? String(metrics.actualRR) : null,
			profitLoss: metrics.profitLoss != null ? String(metrics.profitLoss) : null,
			profitLossPercent: metrics.profitLossPercent != null ? String(metrics.profitLossPercent) : null,
			pips: metrics.pips != null ? String(metrics.pips) : null,
			fees: String(data.fees ?? 0),
			openedAt: new Date(data.openedAt),
			closedAt: data.closedAt ? new Date(data.closedAt) : null,
			holdingTimeSeconds: metrics.holdingTimeSeconds != null ? String(metrics.holdingTimeSeconds) : null,
			setup: data.setup ?? null,
			mistakes: data.mistakes ?? null,
			lessons: data.lessons ?? null,
			tags: data.tags ?? null,
		});

		if (!updated) {
			throw new NotFoundError('Trade not found.');
		}

		await tradingAccountService.syncCurrentBalance(userId, data.accountId);
		if (existing.accountId !== data.accountId) {
			await tradingAccountService.syncCurrentBalance(userId, existing.accountId);
		}

		return this.getDetail(id, userId);
	}

	async remove(id: string, userId: string): Promise<void> {
		const existing = await tradeRepository.findByIdForUser(id, userId);
		if (!existing) {
			throw new NotFoundError('Trade not found.');
		}

		const deleted = await tradeRepository.softDeleteForUser(id, userId);
		if (!deleted) {
			throw new NotFoundError('Trade not found.');
		}

		await tradingAccountService.syncCurrentBalance(userId, existing.accountId);
	}

	async addImages(tradeId: string, userId: string, files: File[]): Promise<TradeImageDto[]> {
		const trade = await tradeRepository.findByIdForUser(tradeId, userId);
		if (!trade) {
			throw new NotFoundError('Trade not found.');
		}

		if (files.length === 0) {
			throw new ValidationError('No files provided.');
		}

		const existing = await tradeImageRepository.listByTradeId(tradeId, userId);
		if (existing.length + files.length > MAX_IMAGES_PER_TRADE) {
			throw new ValidationError(`A trade can have at most ${MAX_IMAGES_PER_TRADE} screenshots.`);
		}

		const uploaded: TradeImageDto[] = [];
		let sortOrder = existing.length;

		for (const file of files) {
			if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
				throw new ValidationError(`Unsupported image type: ${file.type || 'unknown'}.`);
			}
			if (file.size > MAX_IMAGE_SIZE_BYTES) {
				throw new ValidationError(`"${file.name}" exceeds the ${Math.round(MAX_IMAGE_SIZE_BYTES / (1024 * 1024))}MB limit.`);
			}

			const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
			const key = `trades/${userId}/${tradeId}/${randomUUID()}.${extension}`;
			const bytes = new Uint8Array(await file.arrayBuffer());
			const { url } = await uploadTradeScreenshot({
				key,
				body: bytes,
				contentType: file.type || 'application/octet-stream',
			});

			const image = await tradeDetailsService.addImage({
				tradeId,
				userId,
				url,
				storageKey: key,
				mimeType: file.type || null,
				sortOrder,
				isPrimary: existing.length === 0 && sortOrder === 0,
			});

			uploaded.push(toImageDto(image));
			sortOrder += 1;
		}

		return uploaded;
	}

	async removeImage(tradeId: string, imageId: string, userId: string): Promise<void> {
		const trade = await tradeRepository.findByIdForUser(tradeId, userId);
		if (!trade) {
			throw new NotFoundError('Trade not found.');
		}

		const images = await tradeImageRepository.listByTradeId(tradeId, userId);
		const image = images.find((candidate) => candidate.id === imageId);
		if (!image) {
			throw new NotFoundError('Image not found.');
		}

		const deleted = await tradeImageRepository.softDeleteForUser(imageId, userId);
		if (!deleted) {
			throw new NotFoundError('Image not found.');
		}

		try {
			await deleteTradeScreenshot(image.storageKey);
		} catch {
			// The DB row is already soft-deleted; a storage cleanup failure shouldn't fail the request.
		}
	}

	async addNote(tradeId: string, userId: string, input: unknown): Promise<TradeNoteDto> {
		const trade = await tradeRepository.findByIdForUser(tradeId, userId);
		if (!trade) {
			throw new NotFoundError('Trade not found.');
		}

		const data = parseOrThrow(tradeNoteFormSchema, input);
		const note = await tradeDetailsService.addNote({
			tradeId,
			userId,
			title: data.title ?? null,
			body: data.body,
			isPinned: data.isPinned,
		});

		return toNoteDto(note);
	}

	async removeNote(tradeId: string, noteId: string, userId: string): Promise<void> {
		const trade = await tradeRepository.findByIdForUser(tradeId, userId);
		if (!trade) {
			throw new NotFoundError('Trade not found.');
		}

		const deleted = await tradeNoteRepository.softDeleteForUser(noteId, userId);
		if (!deleted) {
			throw new NotFoundError('Note not found.');
		}
	}
}

export const tradeJournalService = new TradeJournalService();
