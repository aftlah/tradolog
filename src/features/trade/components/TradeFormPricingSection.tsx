import type { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { FormField, Input } from '@shared/components';
import { XAUUSD_TICKER } from '../constants/trade.constants';
import type { TradeFormOptions } from '../types/trade.types';
import type { TradeFormInput } from '../validators/trade-schemas';

interface TradeFormPricingSectionProps {
	register: UseFormRegister<TradeFormInput>;
	errors: FieldErrors<TradeFormInput>;
	watch: UseFormWatch<TradeFormInput>;
	options: TradeFormOptions;
}

export function TradeFormPricingSection({ register, errors, watch, options }: TradeFormPricingSectionProps) {
	const status = watch('status');
	const symbolId = watch('symbolId');
	const exitRequired = status === 'closed';
	const selectedSymbol = options.symbols.find((symbol) => symbol.id === symbolId);
	const isXauusd = selectedSymbol?.ticker === XAUUSD_TICKER;

	return (
		<div className="glass-card space-y-5 p-6">
			<h2 className="text-sm font-medium text-muted">Prices &amp; Size</h2>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<FormField id="entryPrice" label="Entry Price" error={errors.entryPrice?.message as string | undefined}>
					<Input id="entryPrice" inputMode="decimal" placeholder={isXauusd ? '2350.00' : '1.0850'} {...register('entryPrice')} />
				</FormField>

				<FormField
					id="exitPrice"
					label="Exit Price"
					optional={!exitRequired}
					hint={exitRequired ? undefined : 'Filling exit price closes the trade and sets Closed At automatically.'}
					error={errors.exitPrice?.message as string | undefined}
				>
					<Input id="exitPrice" inputMode="decimal" placeholder={isXauusd ? '2365.00' : '1.0900'} {...register('exitPrice')} />
				</FormField>

				<FormField
					id="quantity"
					label={isXauusd ? 'Lots' : 'Quantity / Size'}
					hint={isXauusd ? '1.0 lot = 100 oz (standard XAUUSD).' : undefined}
					error={errors.quantity?.message as string | undefined}
				>
					<Input id="quantity" inputMode="decimal" placeholder={isXauusd ? '0.10' : '1.00'} {...register('quantity')} />
				</FormField>

				<FormField id="stopLoss" label="Stop Loss" optional error={errors.stopLoss?.message as string | undefined}>
					<Input id="stopLoss" inputMode="decimal" placeholder={isXauusd ? '2340.00' : '1.0800'} {...register('stopLoss')} />
				</FormField>

				<FormField id="takeProfit" label="Take Profit" optional error={errors.takeProfit?.message as string | undefined}>
					<Input id="takeProfit" inputMode="decimal" placeholder={isXauusd ? '2380.00' : '1.1000'} {...register('takeProfit')} />
				</FormField>

				<FormField id="fees" label="Fees" optional error={errors.fees?.message as string | undefined}>
					<Input id="fees" inputMode="decimal" placeholder="0.00" {...register('fees')} />
				</FormField>
			</div>

			<p className="text-xs text-muted">
				{isXauusd
					? 'XAUUSD P&L uses contract size 100: (exit − entry) × lots × 100 − fees. Profit / Lot is shown on the trade detail.'
					: 'Risk, reward, RR, P&L, pips, and holding time are calculated automatically from these values once saved.'}
			</p>
		</div>
	);
}
