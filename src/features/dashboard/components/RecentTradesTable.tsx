import { useMemo } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowDownRight, ArrowUpRight, ListChecks } from 'lucide-react';
import {
	Badge,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@shared/components';
import { formatDate, formatRiskReward, formatSignedCurrency, formatSignedPercent } from '@shared/utils/format';
import type { DashboardRecentTrade } from '../types/dashboard.types';

interface RecentTradesTableProps {
	trades: DashboardRecentTrade[];
	currency: string;
}

const RESULT_BADGE: Record<NonNullable<DashboardRecentTrade['result']> | 'pending', { label: string; variant: 'success' | 'danger' | 'muted' | 'warning' }> = {
	win: { label: 'Win', variant: 'success' },
	loss: { label: 'Loss', variant: 'danger' },
	breakeven: { label: 'Breakeven', variant: 'muted' },
	pending: { label: 'Open', variant: 'warning' },
};

const columnHelper = createColumnHelper<DashboardRecentTrade>();

export function RecentTradesTable({ trades, currency }: RecentTradesTableProps) {
	const columns = useMemo(
		() => [
			columnHelper.accessor('symbol', {
				header: 'Symbol',
				cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
			}),
			columnHelper.accessor('side', {
				header: 'Side',
				cell: (info) => (
					<span className="inline-flex items-center gap-1 text-sm capitalize">
						{info.getValue() === 'long' ? (
							<ArrowUpRight className="size-3.5 text-success" aria-hidden="true" />
						) : (
							<ArrowDownRight className="size-3.5 text-danger" aria-hidden="true" />
						)}
						{info.getValue()}
					</span>
				),
			}),
			columnHelper.accessor('strategy', {
				header: 'Strategy',
				cell: (info) => <span className="text-muted">{info.getValue() ?? '—'}</span>,
			}),
			columnHelper.accessor('profitLoss', {
				header: 'P&L',
				cell: (info) => {
					const value = info.getValue();
					if (value === null) {
						return <span className="text-muted">—</span>;
					}
					return (
						<span className={value >= 0 ? 'font-medium text-success' : 'font-medium text-danger'}>
							{formatSignedCurrency(value, currency)}
						</span>
					);
				},
			}),
			columnHelper.accessor('profitLossPercent', {
				header: 'P&L %',
				cell: (info) => {
					const value = info.getValue();
					return value === null ? <span className="text-muted">—</span> : formatSignedPercent(value);
				},
			}),
			columnHelper.accessor('actualRR', {
				header: 'RR',
				cell: (info) => formatRiskReward(info.getValue()),
			}),
			columnHelper.accessor('result', {
				header: 'Result',
				cell: (info) => {
					const result = info.getValue() ?? 'pending';
					const badge = RESULT_BADGE[result];
					return <Badge variant={badge.variant}>{badge.label}</Badge>;
				},
			}),
			columnHelper.accessor('closedAt', {
				header: 'Closed',
				cell: (info) => {
					const value = info.getValue();
					return <span className="text-muted">{value ? formatDate(value) : '—'}</span>;
				},
			}),
		],
		[currency],
	);

	const table = useReactTable({
		data: trades,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="glass-card p-6">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="text-sm font-medium text-muted">Recent Trades</h2>
					<p className="text-lg font-semibold tracking-tight text-foreground">Latest activity</p>
				</div>
				<div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<ListChecks className="size-4.5" aria-hidden="true" />
				</div>
			</div>

			{trades.length === 0 ? (
				<p className="py-10 text-center text-sm text-muted">
					No trades logged yet. Once Trade CRUD ships, your recent activity will show up here.
				</p>
			) : (
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
