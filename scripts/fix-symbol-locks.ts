
import 'dotenv/config';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { getDb } from '../src/shared/lib/db';
import { symbols, user } from '../src/shared/lib/db/schema';

const SYSTEM_TICKERS = ['XAUUSD', 'BTCUSD'] as const;
const UNLOCK_TICKERS = ['EURUSD', 'GBPUSD', 'NAS100'] as const;

const UNLOCK_DEFS = [
	{
		ticker: 'EURUSD' as const,
		name: 'Euro / US Dollar',
		marketType: 'forex' as const,
		baseAsset: 'EUR',
		quoteAsset: 'USD',
		pipSize: '0.0001',
		pricePrecision: 5,
	},
	{
		ticker: 'GBPUSD' as const,
		name: 'British Pound / US Dollar',
		marketType: 'forex' as const,
		baseAsset: 'GBP',
		quoteAsset: 'USD',
		pipSize: '0.0001',
		pricePrecision: 5,
	},
	{
		ticker: 'NAS100' as const,
		name: 'Nasdaq 100',
		marketType: 'indices' as const,
		baseAsset: 'NAS100',
		quoteAsset: 'USD',
		pipSize: '0.1',
		pricePrecision: 1,
	},
];

async function main() {
	const db = getDb();
	const now = new Date();

	// Soft-delete legacy system copies of unlocked tickers.
	const softDeleted = await db
		.update(symbols)
		.set({ deletedAt: now, updatedAt: now })
		.where(
			and(
				isNull(symbols.userId),
				isNull(symbols.deletedAt),
				inArray(symbols.ticker, [...UNLOCK_TICKERS]),
			),
		)
		.returning({ id: symbols.id, ticker: symbols.ticker });

	console.log(`Soft-deleted ${softDeleted.length} legacy system symbol(s):`, softDeleted.map((row) => row.ticker));

	const users = await db.select({ id: user.id, email: user.email }).from(user);
	let created = 0;

	for (const accountUser of users) {
		for (const def of UNLOCK_DEFS) {
			const existing = await db
				.select({ id: symbols.id })
				.from(symbols)
				.where(
					and(
						eq(symbols.userId, accountUser.id),
						eq(symbols.ticker, def.ticker),
						isNull(symbols.deletedAt),
					),
				)
				.limit(1);

			if (existing[0]) {
				continue;
			}

			await db.insert(symbols).values({
				userId: accountUser.id,
				...def,
				isActive: true,
			});
			created += 1;
			console.log(`Created ${def.ticker} for ${accountUser.email ?? accountUser.id}`);
		}
	}

	const systemLeft = await db
		.select({ ticker: symbols.ticker })
		.from(symbols)
		.where(and(isNull(symbols.userId), isNull(symbols.deletedAt), inArray(symbols.ticker, [...SYSTEM_TICKERS])));

	console.log(`Done. Created ${created} user-owned symbol(s). System locks remaining:`, systemLeft.map((row) => row.ticker));
	process.exit(0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
