import 'dotenv/config';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb } from '../index';
import {
	accounts,
	monthlyGoals,
	profiles,
	strategies,
	symbols,
	user,
	watchlists,	
} from '../schema';

const SEED_USER_ID = 'seed-tradolog-demo-user';

async function ensureSeedUser() {
	const db = getDb();
	const existing = await db.select().from(user).where(eq(user.id, SEED_USER_ID)).limit(1);
	if (existing[0]) {
		return existing[0];
	}

	const rows = await db
		.insert(user)
		.values({
			id: SEED_USER_ID,
			name: 'Demo Trader',
			email: 'demo@tradolog.local',
			emailVerified: true,
		})
		.returning();

	const created = rows[0];
	if (!created) {
		throw new Error('Failed to create seed user.');
	}
	return created;
}

async function seed() {
	const db = getDb();
	const seedUser = await ensureSeedUser();

	const existingProfile = await db
		.select()
		.from(profiles)
		.where(eq(profiles.userId, seedUser.id))
		.limit(1);

	if (!existingProfile[0]) {
		await db.insert(profiles).values({
			userId: seedUser.id,
			displayName: 'Demo Trader',
			timezone: 'UTC',
			baseCurrency: 'USD',
			riskPerTradePercent: '1.0000',
			defaultRiskReward: '2.0000',
			onboardingCompleted: true,
		});
	}

	/** Global catalog — locked in Settings (not editable/deletable by traders). */
	const systemSymbols = [
		{
			ticker: 'XAUUSD',
			name: 'Gold / US Dollar',
			marketType: 'forex' as const,
			baseAsset: 'XAU',
			quoteAsset: 'USD',
			pipSize: '0.01',
			pricePrecision: 2,
		},
		{
			ticker: 'BTCUSD',
			name: 'Bitcoin / US Dollar',
			marketType: 'crypto' as const,
			baseAsset: 'BTC',
			quoteAsset: 'USD',
			pipSize: '0.01',
			pricePrecision: 2,
		},
	];

	/** Starter instruments owned by the seed user — editable (no System lock). */
	const userOwnedSymbols = [
		{
			ticker: 'EURUSD',
			name: 'Euro / US Dollar',
			marketType: 'forex' as const,
			baseAsset: 'EUR',
			quoteAsset: 'USD',
			pipSize: '0.0001',
			pricePrecision: 5,
		},
		{
			ticker: 'GBPUSD',
			name: 'British Pound / US Dollar',
			marketType: 'forex' as const,
			baseAsset: 'GBP',
			quoteAsset: 'USD',
			pipSize: '0.0001',
			pricePrecision: 5,
		},
		{
			ticker: 'NAS100',
			name: 'Nasdaq 100',
			marketType: 'indices' as const,
			baseAsset: 'NAS100',
			quoteAsset: 'USD',
			pipSize: '0.1',
			pricePrecision: 1,
		},
	];

	for (const symbol of systemSymbols) {
		const found = await db
			.select()
			.from(symbols)
			.where(and(isNull(symbols.userId), eq(symbols.ticker, symbol.ticker), isNull(symbols.deletedAt)))
			.limit(1);

		if (!found[0]) {
			await db.insert(symbols).values({
				userId: null,
				...symbol,
				isActive: true,
			});
		}
	}

	// Soft-delete legacy system copies of tickers that are now user-owned only.
	for (const symbol of userOwnedSymbols) {
		await db
			.update(symbols)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(and(isNull(symbols.userId), eq(symbols.ticker, symbol.ticker), isNull(symbols.deletedAt)));
	}

	for (const symbol of userOwnedSymbols) {
		const found = await db
			.select()
			.from(symbols)
			.where(and(eq(symbols.userId, seedUser.id), eq(symbols.ticker, symbol.ticker), isNull(symbols.deletedAt)))
			.limit(1);

		if (!found[0]) {
			await db.insert(symbols).values({
				userId: seedUser.id,
				...symbol,
				isActive: true,
			});
		}
	}

	const existingAccounts = await db
		.select()
		.from(accounts)
		.where(eq(accounts.userId, seedUser.id))
		.limit(1);

	if (!existingAccounts[0]) {
		await db.insert(accounts).values({
			userId: seedUser.id,
			name: 'Demo FTMO',
			broker: 'FTMO',
			accountType: 'demo',
			currency: 'USD',
			startingBalance: '100000',
			currentBalance: '100000',
			leverage: 100,
			isDefault: true,
		});
	}

	const existingStrategies = await db
		.select()
		.from(strategies)
		.where(eq(strategies.userId, seedUser.id))
		.limit(1);

	if (!existingStrategies[0]) {
		await db.insert(strategies).values([
			{
				userId: seedUser.id,
				name: 'Breakout Continuity',
				description: 'Trade session breakouts with confirmation candle.',
				color: '#2563EB',
				isActive: true,
			},
			{
				userId: seedUser.id,
				name: 'Mean Reversion',
				description: 'Fade extended moves into key levels.',
				color: '#22C55E',
				isActive: true,
			},
		]);
	}

	const now = new Date();
	const existingGoal = await db
		.select()
		.from(monthlyGoals)
		.where(eq(monthlyGoals.userId, seedUser.id))
		.limit(1);

	if (!existingGoal[0]) {
		await db.insert(monthlyGoals).values({
			userId: seedUser.id,
			year: now.getUTCFullYear(),
			month: now.getUTCMonth() + 1,
			title: 'Consistent execution month',
			description: 'Hit process targets before profit targets.',
			targetProfit: '5000',
			targetWinRate: '55.0000',
			targetTradeCount: 40,
			maxDrawdownPercent: '5.0000',
			status: 'active',
		});
	}

	const eurusd = await db.select().from(symbols).where(eq(symbols.ticker, 'EURUSD')).limit(1);
	const eurusdRow = eurusd[0];

	if (eurusdRow) {
		const existingWatch = await db
			.select()
			.from(watchlists)
			.where(eq(watchlists.userId, seedUser.id))
			.limit(1);

		if (!existingWatch[0]) {
			await db.insert(watchlists).values({
				userId: seedUser.id,
				symbolId: eurusdRow.id,
				listName: 'Default',
				notes: 'Primary FX pair',
				sortOrder: 0,
				isPinned: true,
			});
		}
	}

	console.info(
		JSON.stringify({
			level: 'info',
			event: 'db.seed.completed',
			userId: seedUser.id,
		}),
	);
}

seed()
	.then(() => {
		process.exit(0);
	})
	.catch((error: unknown) => {
		console.error(
			JSON.stringify({
				level: 'error',
				event: 'db.seed.failed',
				message: error instanceof Error ? error.message : 'Unknown seed error',
			}),
		);
		process.exit(1);
	});
