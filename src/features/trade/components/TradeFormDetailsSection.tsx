import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormWatch } from 'react-hook-form';
import { FormField, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components';
import { SESSION_OPTIONS, SIDE_OPTIONS, STATUS_OPTIONS } from '../constants/trade.constants';
import type { TradeFormOptions } from '../types/trade.types';
import type { TradeFormInput } from '../validators/trade-schemas';

const NONE_VALUE = '__none__';

interface TradeFormDetailsSectionProps {
	register: UseFormRegister<TradeFormInput>;
	control: Control<TradeFormInput>;
	errors: FieldErrors<TradeFormInput>;
	watch: UseFormWatch<TradeFormInput>;
	options: TradeFormOptions;
}

/** Account / symbol / strategy / side / status / session pickers plus the opened/closed timestamps. */
export function TradeFormDetailsSection({ register, control, errors, watch, options }: TradeFormDetailsSectionProps) {
	const status = watch('status');

	return (
		<div className="glass-card space-y-5 p-6">
			<h2 className="text-sm font-medium text-muted">Trade Setup</h2>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<FormField id="accountId" label="Account" error={errors.accountId?.message}>
					<Controller
						name="accountId"
						control={control}
						render={({ field }) => (
							<Select value={field.value as string} onValueChange={field.onChange}>
								<SelectTrigger id="accountId" aria-invalid={Boolean(errors.accountId)}>
									<SelectValue placeholder="Select account" />
								</SelectTrigger>
								<SelectContent>
									{options.accounts.map((account) => (
										<SelectItem key={account.id} value={account.id}>
											{account.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</FormField>

				<FormField id="symbolId" label="Symbol" error={errors.symbolId?.message}>
					<Controller
						name="symbolId"
						control={control}
						render={({ field }) => (
							<Select value={field.value as string} onValueChange={field.onChange}>
								<SelectTrigger id="symbolId" aria-invalid={Boolean(errors.symbolId)}>
									<SelectValue placeholder="Select symbol" />
								</SelectTrigger>
								<SelectContent>
									{options.symbols.map((symbol) => (
										<SelectItem key={symbol.id} value={symbol.id}>
											{symbol.ticker}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</FormField>

				<FormField id="strategyId" label="Strategy" optional error={errors.strategyId?.message}>
					<Controller
						name="strategyId"
						control={control}
						render={({ field }) => (
							<Select
								value={(field.value as string) || NONE_VALUE}
								onValueChange={(value) => field.onChange(value === NONE_VALUE ? '' : value)}
							>
								<SelectTrigger id="strategyId">
									<SelectValue placeholder="No strategy" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={NONE_VALUE}>No strategy</SelectItem>
									{options.strategies.map((strategy) => (
										<SelectItem key={strategy.id} value={strategy.id}>
											{strategy.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</FormField>

				<FormField id="side" label="Side" error={errors.side?.message}>
					<Controller
						name="side"
						control={control}
						render={({ field }) => (
							<Select value={field.value as string} onValueChange={field.onChange}>
								<SelectTrigger id="side">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SIDE_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</FormField>

				<FormField id="status" label="Status" error={errors.status?.message}>
					<Controller
						name="status"
						control={control}
						render={({ field }) => (
							<Select value={field.value as string} onValueChange={field.onChange}>
								<SelectTrigger id="status">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{STATUS_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</FormField>

				<FormField id="session" label="Session" optional error={errors.session?.message}>
					<Controller
						name="session"
						control={control}
						render={({ field }) => (
							<Select
								value={(field.value as string) || NONE_VALUE}
								onValueChange={(value) => field.onChange(value === NONE_VALUE ? '' : value)}
							>
								<SelectTrigger id="session">
									<SelectValue placeholder="No session" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={NONE_VALUE}>No session</SelectItem>
									{SESSION_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</FormField>

				<FormField id="openedAt" label="Opened At" error={errors.openedAt?.message}>
					<Input id="openedAt" type="datetime-local" aria-invalid={Boolean(errors.openedAt)} {...register('openedAt')} />
				</FormField>

				<FormField
					id="closedAt"
					label="Closed At"
					optional={status !== 'closed'}
					hint={status === 'closed' ? undefined : 'Required once the trade is closed.'}
					error={errors.closedAt?.message}
				>
					<Input id="closedAt" type="datetime-local" aria-invalid={Boolean(errors.closedAt)} {...register('closedAt')} />
				</FormField>
			</div>
		</div>
	);
}
