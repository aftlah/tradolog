import { cn } from '@shared/utils/cn';
import type { SharedJournalViewDto } from '../types/sharing.types';

interface SharedJournalPanelProps {
	view: SharedJournalViewDto;
	onAccountChange: (accountId: string) => void;
}

function formatMoney(value: number, currency: string): string {
	try {
		return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
	} catch {
		return `${value.toFixed(2)} ${currency}`;
	}
}

function formatPct(value: number): string {
	return `${value.toFixed(1)}%`;
}

function pnlClass(value: number | null): string {
	if (value === null || value === 0) {
		return 'text-muted';
	}
	return value > 0 ? 'text-success' : 'text-danger';
}

/** Read-only mentor view of a trader's stats + recent trades. */
export function SharedJournalPanel({ view, onAccountChange }: SharedJournalPanelProps) {
	const { share, accounts, activeAccountId, currency, performance, recentTrades, currentBalance, startingBalance } =
		view;

	return (
		<div className="glass-card space-y-6 p-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="text-xs font-medium tracking-wide text-muted uppercase">Read-only journal</p>
					<h2 className="mt-1 text-xl font-semibold text-foreground">{share.ownerName ?? 'Trader'}</h2>
					<p className="text-sm text-muted">{share.ownerEmail}</p>
				</div>
				{accounts.length > 0 ? (
					<label className="block text-sm text-muted">
						Account
						<select
							className="mt-1 flex h-11 w-full min-w-48 appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground"
							value={activeAccountId ?? ''}
							onChange={(event) => onAccountChange(event.target.value)}
						>
							{accounts.map((account) => (
								<option key={account.id} value={account.id} className="bg-surface text-foreground">
									{account.name}
								</option>
							))}
						</select>
					</label>
				) : null}
			</div>

			{!activeAccountId ? (
				<p className="text-sm text-muted">This trader has no trading accounts yet.</p>
			) : (
				<>
					<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
							<p className="text-xs text-muted">Win rate</p>
							<p className="mt-1 text-2xl font-semibold text-foreground">{formatPct(performance.winRate)}</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
							<p className="text-xs text-muted">Profit factor</p>
							<p className="mt-1 text-2xl font-semibold text-foreground">
								{performance.profitFactor === null
									? '—'
									: Number.isFinite(performance.profitFactor)
										? performance.profitFactor.toFixed(2)
										: '∞'}
							</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
							<p className="text-xs text-muted">Closed trades</p>
							<p className="mt-1 text-2xl font-semibold text-foreground">{performance.totalTrades}</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
							<p className="text-xs text-muted">Balance</p>
							<p className="mt-1 text-lg font-semibold text-foreground">{formatMoney(currentBalance, currency)}</p>
							<p className="text-xs text-muted">Start {formatMoney(startingBalance, currency)}</p>
						</div>
					</div>

					<div>
						<h3 className="text-sm font-medium text-muted">Recent trades</h3>
						{recentTrades.length === 0 ? (
							<p className="mt-3 text-sm text-muted">No trades on this account yet.</p>
						) : (
							<div className="mt-3 overflow-x-auto rounded-2xl border border-white/10">
								<table className="w-full min-w-[40rem] text-left text-sm">
									<thead className="bg-white/[0.03] text-xs text-muted">
										<tr>
											<th className="px-4 py-3 font-medium">Symbol</th>
											<th className="px-4 py-3 font-medium">Side</th>
											<th className="px-4 py-3 font-medium">Status</th>
											<th className="px-4 py-3 font-medium">Strategy</th>
											<th className="px-4 py-3 font-medium text-right">P&amp;L</th>
											<th className="px-4 py-3 font-medium text-right">RR</th>
										</tr>
									</thead>
									<tbody>
										{recentTrades.map((trade) => (
											<tr key={trade.id} className="border-t border-white/5">
												<td className="px-4 py-3 font-medium text-foreground">{trade.symbol}</td>
												<td className="px-4 py-3 capitalize text-muted">{trade.side}</td>
												<td className="px-4 py-3 capitalize text-muted">{trade.status}</td>
												<td className="px-4 py-3 text-muted">{trade.strategy ?? '—'}</td>
												<td className={cn('px-4 py-3 text-right tabular-nums', pnlClass(trade.profitLoss))}>
													{trade.profitLoss === null ? '—' : formatMoney(trade.profitLoss, currency)}
												</td>
												<td className="px-4 py-3 text-right tabular-nums text-muted">
													{trade.actualRR === null ? '—' : trade.actualRR.toFixed(2)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
