/**
 * Optional helper (NOT part of `npm run db:seed`) that creates a login-able demo user with a
 * trading account and closed trades, so the Dashboard can be verified end-to-end.
 *
 * Usage: npx tsx scripts/seed-demo-dashboard.ts
 */
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { getDb } from '../src/shared/lib/db';
import { user } from '../src/shared/lib/db/schema';
import { getAuth } from '../src/shared/lib/auth';
import {
	strategyService,
	symbolService,
	tradeService,
	tradingAccountService,
	tradingCalculatorService,
} from '../src/shared/services';

const DEMO_EMAIL = 'demo.trader@tradolog.dev';
const DEMO_PASSWORD = 'DemoTrader123!';
const DEMO_NAME = 'Demo Trader';

async function ensureDemoUser(): Promise<string> {
	const db = getDb();
	const existing = await db.select().from(user).where(eq(user.email, DEMO_EMAIL)).limit(1);
	if (existing[0]) {
		return existing[0].id;
	}

	await getAuth().api.signUpEmail({
		body: { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: DEMO_NAME },
	});

	const created = await db.select().from(user).where(eq(user.email, DEMO_EMAIL)).limit(1);
	const row = created[0];
	if (!row) {
		throw new Error('Failed to create demo user.');
	}
	return row.id;
}

async function ensureAccount(userId: string) {
	const accounts = await tradingAccountService.list(userId);
	const existing = accounts.find((account) => account.name === 'Demo Swing Account');
	if (existing) {
		return existing;
	}
	return tradingAccountService.create({
		userId,
		name: 'Demo Swing Account',
		broker: 'Tradolog Sim',
		accountType: 'demo',
		currency: 'USD',
		startingBalance: '25000',
		currentBalance: '25000',
		leverage: 50,
		isDefault: true,
	});
}

async function ensureSymbols(userId: string) {
	const symbols = await symbolService.listForUser(userId);
	const tickers = new Set(symbols.map((symbol) => symbol.ticker));

	if (!tickers.has('EURUSD')) {
		await symbolService.create({
			userId,
			ticker: 'EURUSD',
			name: 'Euro / US Dollar',
			marketType: 'forex',
			baseAsset: 'EUR',
			quoteAsset: 'USD',
			pipSize: '0.0001',
			pricePrecision: 5,
			isActive: true,
		});
	}

	if (!tickers.has('XAUUSD') && !symbols.some((symbol) => symbol.ticker === 'XAUUSD')) {
		// XAUUSD is normally a system symbol; only create a user copy if catalog is empty.
		await symbolService.create({
			userId,
			ticker: 'XAUUSD',
			name: 'Gold / US Dollar',
			marketType: 'forex',
			baseAsset: 'XAU',
			quoteAsset: 'USD',
			pipSize: '0.01',
			pricePrecision: 2,
			isActive: true,
		});
	}

	return symbolService.listForUser(userId);
}

async function ensureStrategies(userId: string) {
	const strategies = await strategyService.list(userId);
	if (strategies.length > 0) {
		return strategies;
	}
	await strategyService.create({
		userId,
		name: 'Breakout Continuity',
		description: 'Trade session breakouts with confirmation candle.',
		color: '#2563EB',
		isActive: true,
	});
	await strategyService.create({
		userId,
		name: 'Mean Reversion',
		description: 'Fade extended moves into key levels.',
		color: '#22C55E',
		isActive: true,
	});
	return strategyService.list(userId);
}

function randomBetween(min: number, max: number): number {
	return min + Math.random() * (max - min);
}

function pick<T>(items: T[]): T {
	const item = items[Math.floor(Math.random() * items.length)];
	if (item === undefined) {
		throw new Error('Cannot pick from an empty array.');
	}
	return item;
}

async function seedTrades(
	userId: string,
	accountId: string,
	symbols: { id: string; ticker: string; pipSize: string | null }[],
	strategies: { id: string }[],
) {
	const existingTrades = await tradeService.list(userId);
	if (existingTrades.some((trade) => trade.accountId === accountId)) {
		console.info('Demo trades already exist for this account — skipping.');
		return;
	}

	const priceRanges: Record<string, [number, number]> = {
		EURUSD: [1.05, 1.1],
		XAUUSD: [2300, 2450],
	};

	const now = Date.now();
	const dayMs = 24 * 60 * 60 * 1000;
	const tradeCount = 28;

	for (let i = 0; i < tradeCount; i += 1) {
		const symbol = pick(symbols);
		const strategy = pick(strategies);
		const side: 'long' | 'short' = Math.random() > 0.5 ? 'long' : 'short';
		const [lo, hi] = priceRanges[symbol.ticker] ?? [100, 110];
		const entryPrice = randomBetween(lo, hi);
		const riskDistance = (hi - lo) * randomBetween(0.01, 0.03);
		const rewardMultiple = randomBetween(1.2, 3);
		const stopLoss = side === 'long' ? entryPrice - riskDistance : entryPrice + riskDistance;
		const takeProfit =
			side === 'long' ? entryPrice + riskDistance * rewardMultiple : entryPrice - riskDistance * rewardMultiple;

		const isWin = Math.random() < 0.55;
		const exitPrice = isWin
			? takeProfit
			: side === 'long'
				? stopLoss + riskDistance * randomBetween(0, 0.3)
				: stopLoss - riskDistance * randomBetween(0, 0.3);

		const quantity = symbol.ticker === 'XAUUSD' ? randomBetween(0.5, 2) : randomBetween(10_000, 50_000);
		const daysAgo = tradeCount - i;
		const openedAt = new Date(now - daysAgo * dayMs - randomBetween(0, 6) * 60 * 60 * 1000);
		const closedAt = new Date(openedAt.getTime() + randomBetween(1, 30) * 60 * 60 * 1000);

		const metrics = tradingCalculatorService.tradeMetrics({
			side,
			entryPrice,
			exitPrice,
			stopLoss,
			takeProfit,
			quantity,
			fees: 2,
			pipSize: symbol.pipSize,
			openedAt,
			closedAt,
		});

		const result =
			metrics.profitLoss === null
				? null
				: metrics.profitLoss > 0
					? 'win'
					: metrics.profitLoss < 0
						? 'loss'
						: 'breakeven';

		await tradeService.create({
			userId,
			accountId,
			symbolId: symbol.id,
			strategyId: strategy.id,
			side,
			status: 'closed',
			result,
			entryPrice: String(entryPrice),
			exitPrice: String(exitPrice),
			stopLoss: String(stopLoss),
			takeProfit: String(takeProfit),
			quantity: String(quantity),
			riskAmount: metrics.riskAmount === null ? null : String(metrics.riskAmount),
			rewardAmount: metrics.rewardAmount === null ? null : String(metrics.rewardAmount),
			plannedRr: metrics.plannedRR === null ? null : String(metrics.plannedRR),
			actualRr: metrics.actualRR === null ? null : String(metrics.actualRR),
			profitLoss: metrics.profitLoss === null ? null : String(metrics.profitLoss),
			profitLossPercent: metrics.profitLossPercent === null ? null : String(metrics.profitLossPercent),
			pips: metrics.pips === null ? null : String(metrics.pips),
			fees: '2',
			openedAt,
			closedAt,
			holdingTimeSeconds: metrics.holdingTimeSeconds === null ? null : String(metrics.holdingTimeSeconds),
		});
	}

	console.info(`Seeded ${tradeCount} demo trades.`);
}

async function main() {
	const userId = await ensureDemoUser();
	const account = await ensureAccount(userId);
	const symbols = await ensureSymbols(userId);
	const strategies = await ensureStrategies(userId);
	await seedTrades(userId, account.id, symbols, strategies);

	console.info('\nDemo dashboard ready:');
	console.info(`  Email:    ${DEMO_EMAIL}`);
	console.info(`  Password: ${DEMO_PASSWORD}`);
	console.info('  URL:      /login → /app');
}

main()
	.then(() => process.exit(0))
	.catch((error: unknown) => {
		console.error(error);
		process.exit(1);
	});
