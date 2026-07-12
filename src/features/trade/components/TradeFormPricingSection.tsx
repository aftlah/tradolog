import type { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { FormField, Input } from '@shared/components';
import type { TradeFormInput } from '../validators/trade-schemas';

interface TradeFormPricingSectionProps {
	register: UseFormRegister<TradeFormInput>;
	errors: FieldErrors<TradeFormInput>;
	watch: UseFormWatch<TradeFormInput>;
}

/** Entry/exit prices, stop loss / take profit, size, and fees — the raw inputs every calculation derives from. */
export function TradeFormPricingSection({ register, errors, watch }: TradeFormPricingSectionProps) {
	const status = watch('status');
	const exitRequired = status === 'closed';

	return (
		<div className="glass-card space-y-5 p-6">
			<h2 className="text-sm font-medium text-muted">Prices &amp; Size</h2>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<FormField id="entryPrice" label="Entry Price" error={errors.entryPrice?.message as string | undefined}>
					<Input id="entryPrice" inputMode="decimal" placeholder="1.0850" {...register('entryPrice')} />
				</FormField>

				<FormField
					id="exitPrice"
					label="Exit Price"
					optional={!exitRequired}
					hint={exitRequired ? undefined : 'Required once the trade is closed.'}
					error={errors.exitPrice?.message as string | undefined}
				>
					<Input id="exitPrice" inputMode="decimal" placeholder="1.0900" {...register('exitPrice')} />
				</FormField>

				<FormField id="quantity" label="Quantity / Size" error={errors.quantity?.message as string | undefined}>
					<Input id="quantity" inputMode="decimal" placeholder="1.00" {...register('quantity')} />
				</FormField>

				<FormField id="stopLoss" label="Stop Loss" optional error={errors.stopLoss?.message as string | undefined}>
					<Input id="stopLoss" inputMode="decimal" placeholder="1.0800" {...register('stopLoss')} />
				</FormField>

				<FormField id="takeProfit" label="Take Profit" optional error={errors.takeProfit?.message as string | undefined}>
					<Input id="takeProfit" inputMode="decimal" placeholder="1.1000" {...register('takeProfit')} />
				</FormField>

				<FormField id="fees" label="Fees" optional error={errors.fees?.message as string | undefined}>
					<Input id="fees" inputMode="decimal" placeholder="0.00" {...register('fees')} />
				</FormField>
			</div>

			<p className="text-xs text-muted">
				Risk, reward, RR, P&amp;L, pips, and holding time are calculated automatically from these values once saved.
			</p>
		</div>
	);
}
