import type { FieldErrors, UseFormRegister, UseFormRegisterReturn, UseFormWatch } from 'react-hook-form';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { FormField, Input } from '@shared/components';
import type { TradeSide } from '@shared/types';
import { cn } from '@shared/utils/cn';
import { SESSION_OPTIONS, SIDE_OPTIONS, STATUS_OPTIONS } from '../constants/trade.constants';
import type { TradeFormOptions } from '../types/trade.types';
import type { TradeFormInput } from '../validators/trade-schemas';

const selectClassName = cn(
	'flex h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 pr-10 text-sm text-foreground shadow-soft backdrop-blur-md transition-colors duration-200',
	'focus-visible:outline-none focus-visible:border-primary/45 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring focus-visible:ring-offset-0',
	'disabled:cursor-not-allowed disabled:opacity-50',
);

interface TradeFormDetailsSectionProps {
	register: UseFormRegister<TradeFormInput>;
	errors: FieldErrors<TradeFormInput>;
	watch: UseFormWatch<TradeFormInput>;
	options: TradeFormOptions;
	inferredSide: TradeSide | null;
}

interface NativeSelectProps {
	id: string;
	invalid?: boolean;
	disabled?: boolean;
	children: ReactNode;
	registerProps: UseFormRegisterReturn;
}

function NativeSelect({ id, invalid, disabled, children, registerProps }: NativeSelectProps) {
	return (
		<div className="relative">
			<select id={id} disabled={disabled} aria-invalid={invalid} className={selectClassName} {...registerProps}>
				{children}
			</select>
			<ChevronDown
				className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted"
				aria-hidden="true"
			/>
		</div>
	);
}

export function TradeFormDetailsSection({
	register,
	errors,
	watch,
	options,
	inferredSide,
}: TradeFormDetailsSectionProps) {
	const status = watch('status');
	const side = watch('side');
	const sideLabel = SIDE_OPTIONS.find((option) => option.value === side)?.label ?? '—';
	const sideLocked = inferredSide !== null;

	return (
		<div className="glass-card space-y-5 p-6">
			<h2 className="text-sm font-medium text-muted">Trade Setup</h2>

			{options.symbols.length === 0 ? (
				<p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning" role="status">
					No symbols yet. Add one under{' '}
					<a href="/app/settings" className="font-medium underline underline-offset-2">
						Settings → Symbols
					</a>{' '}
					before logging a trade.
				</p>
			) : null}

			{options.accounts.length === 0 ? (
				<p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning" role="status">
					No trading accounts yet. Add one under{' '}
					<a href="/app/settings" className="font-medium underline underline-offset-2">
						Settings → Accounts
					</a>
					.
				</p>
			) : null}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<FormField id="accountId" label="Account" error={errors.accountId?.message}>
					<NativeSelect
						id="accountId"
						invalid={Boolean(errors.accountId)}
						disabled={options.accounts.length === 0}
						registerProps={register('accountId')}
					>
						<option value="" className="bg-surface text-foreground">
							Select account
						</option>
						{options.accounts.map((account) => (
							<option key={account.id} value={account.id} className="bg-surface text-foreground">
								{account.name}
							</option>
						))}
					</NativeSelect>
				</FormField>

				<FormField id="symbolId" label="Symbol" error={errors.symbolId?.message}>
					<NativeSelect
						id="symbolId"
						invalid={Boolean(errors.symbolId)}
						disabled={options.symbols.length === 0}
						registerProps={register('symbolId')}
					>
						<option value="" className="bg-surface text-foreground">
							Select symbol
						</option>
						{options.symbols.map((symbol) => (
							<option key={symbol.id} value={symbol.id} className="bg-surface text-foreground">
								{symbol.ticker}
							</option>
						))}
					</NativeSelect>
				</FormField>

				<FormField id="strategyId" label="Strategy" optional error={errors.strategyId?.message as string | undefined}>
					<NativeSelect id="strategyId" registerProps={register('strategyId')}>
						<option value="" className="bg-surface text-foreground">
							No strategy
						</option>
						{options.strategies.map((strategy) => (
							<option key={strategy.id} value={strategy.id} className="bg-surface text-foreground">
								{strategy.name}
							</option>
						))}
					</NativeSelect>
				</FormField>

				<FormField
					id="side"
					label="Side"
					hint={
						sideLocked
							? `Locked: detected as ${inferredSide === 'long' ? 'Long' : 'Short'} from Entry / SL / TP`
							: 'Fill Entry + SL/TP — Side is set automatically and cannot be changed manually'
					}
					error={errors.side?.message}
				>
					<input type="hidden" {...register('side')} />
					<div
						id="side"
						aria-readonly="true"
						className={cn(
							selectClassName,
							'flex items-center text-muted',
							sideLocked && 'border-primary/30 text-foreground',
						)}
					>
						{sideLocked ? sideLabel : 'Waiting for Entry / SL / TP'}
					</div>
				</FormField>

				<FormField id="status" label="Status" error={errors.status?.message}>
					<NativeSelect id="status" invalid={Boolean(errors.status)} registerProps={register('status')}>
						{STATUS_OPTIONS.map((option) => (
							<option key={option.value} value={option.value} className="bg-surface text-foreground">
								{option.label}
							</option>
						))}
					</NativeSelect>
				</FormField>

				<FormField id="session" label="Session" optional error={errors.session?.message as string | undefined}>
					<NativeSelect id="session" registerProps={register('session')}>
						<option value="" className="bg-surface text-foreground">
							No session
						</option>
						{SESSION_OPTIONS.map((option) => (
							<option key={option.value} value={option.value} className="bg-surface text-foreground">
								{option.label}
							</option>
						))}
					</NativeSelect>
				</FormField>

				<FormField id="openedAt" label="Opened At" error={errors.openedAt?.message}>
					<Input id="openedAt" type="datetime-local" aria-invalid={Boolean(errors.openedAt)} {...register('openedAt')} />
				</FormField>

				<FormField
					id="closedAt"
					label="Closed At"
					optional={status !== 'closed'}
					hint={status === 'closed' ? undefined : 'Required once the trade is closed.'}
					error={errors.closedAt?.message as string | undefined}
				>
					<Input id="closedAt" type="datetime-local" aria-invalid={Boolean(errors.closedAt)} {...register('closedAt')} />
				</FormField>
			</div>
		</div>
	);
}

