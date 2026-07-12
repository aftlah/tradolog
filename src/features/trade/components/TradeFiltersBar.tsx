import { useEffect, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@shared/components';
import { useDebouncedValue } from '@shared/hooks';
import { RESULT_OPTIONS, SESSION_OPTIONS, SIDE_OPTIONS, STATUS_OPTIONS } from '../constants/trade.constants';
import type { TradeFormOptions, TradeListQuery } from '../types/trade.types';

interface TradeFiltersBarProps {
	query: TradeListQuery;
	options: Pick<TradeFormOptions, 'symbols' | 'strategies'>;
	onFiltersChange: (patch: Partial<TradeListQuery>) => void;
	onReset: () => void;
}

const ALL_VALUE = 'all';

/** Search + dropdown filters for the Trade Journal table. Every change updates the URL-synced query. */
export function TradeFiltersBar({ query, options, onFiltersChange, onReset }: TradeFiltersBarProps) {
	const [searchInput, setSearchInput] = useState(query.search ?? '');
	const debouncedSearch = useDebouncedValue(searchInput, 400);

	useEffect(() => {
		if (debouncedSearch !== (query.search ?? '')) {
			onFiltersChange({ search: debouncedSearch || undefined });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearch]);

	const hasActiveFilters = Boolean(
		query.search || query.symbolId || query.strategyId || query.side || query.status || query.result || query.session,
	);

	return (
		<div className="glass-card flex flex-col gap-4 p-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="relative w-full max-w-sm">
					<Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
					<Input
						value={searchInput}
						onChange={(event) => setSearchInput(event.target.value)}
						placeholder="Search symbol, strategy, tags…"
						className="pl-10"
						aria-label="Search trades"
					/>
				</div>

				<div className="flex items-center gap-2">
					{hasActiveFilters ? (
						<Button variant="ghost" size="sm" onClick={() => { setSearchInput(''); onReset(); }} className="gap-1.5">
							<X className="size-4" aria-hidden="true" />
							Clear filters
						</Button>
					) : null}
					<Button asChild size="sm" className="gap-1.5">
						<a href="/app/trades/new">
							<Plus className="size-4" aria-hidden="true" />
							New Trade
						</a>
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
				<FilterSelect
					label="Side"
					value={query.side ?? ALL_VALUE}
					onChange={(value) => onFiltersChange({ side: value === ALL_VALUE ? undefined : (value as TradeListQuery['side']) })}
					options={[{ value: ALL_VALUE, label: 'All sides' }, ...SIDE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))]}
				/>
				<FilterSelect
					label="Status"
					value={query.status ?? ALL_VALUE}
					onChange={(value) => onFiltersChange({ status: value === ALL_VALUE ? undefined : (value as TradeListQuery['status']) })}
					options={[{ value: ALL_VALUE, label: 'All statuses' }, ...STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))]}
				/>
				<FilterSelect
					label="Result"
					value={query.result ?? ALL_VALUE}
					onChange={(value) => onFiltersChange({ result: value === ALL_VALUE ? undefined : (value as TradeListQuery['result']) })}
					options={[{ value: ALL_VALUE, label: 'All results' }, ...RESULT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))]}
				/>
				<FilterSelect
					label="Session"
					value={query.session ?? ALL_VALUE}
					onChange={(value) => onFiltersChange({ session: value === ALL_VALUE ? undefined : (value as TradeListQuery['session']) })}
					options={[{ value: ALL_VALUE, label: 'All sessions' }, ...SESSION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))]}
				/>
				<FilterSelect
					label="Symbol"
					value={query.symbolId ?? ALL_VALUE}
					onChange={(value) => onFiltersChange({ symbolId: value === ALL_VALUE ? undefined : value })}
					options={[{ value: ALL_VALUE, label: 'All symbols' }, ...options.symbols.map((s) => ({ value: s.id, label: s.ticker }))]}
				/>
				<FilterSelect
					label="Strategy"
					value={query.strategyId ?? ALL_VALUE}
					onChange={(value) => onFiltersChange({ strategyId: value === ALL_VALUE ? undefined : value })}
					options={[{ value: ALL_VALUE, label: 'All strategies' }, ...options.strategies.map((s) => ({ value: s.id, label: s.name }))]}
				/>
			</div>
		</div>
	);
}

interface FilterSelectProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: Array<{ value: string; label: string }>;
}

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger aria-label={label}>
				<SelectValue placeholder={label} />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
