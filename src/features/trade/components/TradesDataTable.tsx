import { useMemo } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowDownRight, ArrowUpRight, ListChecks } from 'lucide-react';
import {
	Badge,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@shared/components';
import { formatDate, formatNumber, formatRiskReward, formatSignedCurrency, formatSignedPercent } from '@shared/utils/format';
import { RESULT_BADGE, SESSION_LABEL } from '../constants/trade.constants';
import type { TradeListItem, TradeListQuery, TradeSortColumn } from '../types/trade.types';
import { SortableHeader } from './SortableHeader';
import { TradeRowActions } from './TradeRowActions';

interface TradesDataTableProps {
	trades: TradeListItem[];
	query: TradeListQuery;
	isLoading: boolean;
	onSort: (sortBy: TradeSortColumn, sortDir: TradeListQuery['sortDir']) => void;
	onTradeDeleted: () => void;
}

const columnHelper = createColumnHelper<TradeListItem>();

export function TradesDataTable({ trades, query, isLoading, onSort, onTradeDeleted }: TradesDataTableProps) {
	const columns = useMemo(
		() => [
			columnHelper.accessor('openedAt', {
				header: () => <SortableHeader label="Date" column="openedAt" query={query} onSort={onSort} />,
				cell: (info) => {
					const value = info.getValue();
					return <span className="text-muted">{value ? formatDate(value) : '—'}</span>;
				},
			}),
			columnHelper.accessor('symbol', {
				header: 'Symbol',
				cell: (info) => (
					<div className="flex items-center gap-2">
						{info.row.original.side === 'long' ? (
							<ArrowUpRight className="size-3.5 text-success" aria-hidden="true" />
						) : (
							<ArrowDownRight className="size-3.5 text-danger" aria-hidden="true" />
						)}
						<span className="font-medium text-foreground">{info.getValue()}</span>
					</div>
				),
			}),
			columnHelper.accessor('strategy', {
				header: 'Strategy',
				cell: (info) => <span className="text-muted">{info.getValue() ?? '—'}</span>,
			}),
			columnHelper.accessor('session', {
				header: 'Session',
				cell: (info) => {
					const value = info.getValue();
					return <span className="text-muted">{value ? SESSION_LABEL[value] : '—'}</span>;
				},
			}),
			columnHelper.accessor('quantity', {
				header: 'Qty',
				cell: (info) => {
					const value = info.getValue();
					return <span className="text-muted">{value === null ? '—' : formatNumber(value, 2)}</span>;
				},
			}),
			columnHelper.accessor('profitLoss', {
				header: () => <SortableHeader label="P&L" column="profitLoss" query={query} onSort={onSort} />,
				cell: (info) => {
					const value = info.getValue();
					if (value === null) {
						return <span className="text-muted">—</span>;
					}
					return (
						<span className={value >= 0 ? 'font-medium text-success' : 'font-medium text-danger'}>
							{formatSignedCurrency(value, info.row.original.currency)}
						</span>
					);
				},
			}),
			columnHelper.accessor('profitLossPercent', {
				header: () => <SortableHeader label="P&L %" column="profitLossPercent" query={query} onSort={onSort} />,
				cell: (info) => {
					const value = info.getValue();
					return value === null ? <span className="text-muted">—</span> : formatSignedPercent(value);
				},
			}),
			columnHelper.accessor('actualRR', {
				header: () => <SortableHeader label="RR" column="actualRr" query={query} onSort={onSort} />,
				cell: (info) => formatRiskReward(info.getValue()),
			}),
			columnHelper.accessor('status', {
				header: 'Status',
				cell: (info) => {
					const trade = info.row.original;
					const badge = trade.status === 'closed' ? RESULT_BADGE[trade.result ?? 'pending'] : RESULT_BADGE.pending;
					const label =
						trade.status === 'closed' ? badge.label : trade.status.charAt(0).toUpperCase() + trade.status.slice(1);
					return <Badge variant={badge.variant}>{label}</Badge>;
				},
			}),
			columnHelper.display({
				id: 'actions',
				header: '',
				cell: (info) => <TradeRowActions tradeId={info.row.original.id} onDeleted={onTradeDeleted} />,
			}),
		],
		[query, onSort, onTradeDeleted],
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
					<h2 className="text-sm font-medium text-muted">Trade Journal</h2>
					<p className="text-lg font-semibold tracking-tight text-foreground">Every logged trade</p>
				</div>
				<div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<ListChecks className="size-4.5" aria-hidden="true" />
				</div>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 6 }).map((_, index) => (
						<Skeleton key={index} className="h-11 w-full rounded-xl" />
					))}
				</div>
			) : trades.length === 0 ? (
				<p className="py-10 text-center text-sm text-muted">
					No trades match your filters yet. Try clearing filters or log your first trade.
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
