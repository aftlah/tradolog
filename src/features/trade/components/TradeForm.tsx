import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/components';
import { TRADES_API_ROUTE } from '../constants/trade.constants';
import { tradeFormSchema, type TradeFormInput, type TradeFormValues } from '../validators/trade-schemas';
import type { TradeFormOptions } from '../types/trade.types';
import { TradeFormDetailsSection } from './TradeFormDetailsSection';
import { TradeFormPricingSection } from './TradeFormPricingSection';
import { TradeFormJournalSection } from './TradeFormJournalSection';

interface TradeFormProps {
	mode: 'create' | 'edit';
	tradeId?: string;
	options: TradeFormOptions;
	defaultValues: TradeFormInput;
}

/**
 * Single reusable Create/Edit Trade form. Owns validation (RHF + the shared `tradeFormSchema`)
 * and the create/update network call; every derived metric is computed server-side by
 * `TradeJournalService`, so this form only ever submits raw prices/quantities/dates.
 */
export function TradeForm({ mode, tradeId, options, defaultValues }: TradeFormProps) {
	const [submitError, setSubmitError] = useState<string | null>(null);
	const {
		register,
		control,
		watch,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<TradeFormInput, unknown, TradeFormValues>({
		resolver: zodResolver(tradeFormSchema),
		defaultValues,
	});

	async function onSubmit(values: TradeFormValues) {
		setSubmitError(null);
		try {
			const url = mode === 'create' ? TRADES_API_ROUTE : `${TRADES_API_ROUTE}/${tradeId}`;
			const response = await fetch(url, {
				method: mode === 'create' ? 'POST' : 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not save this trade.');
			}

			const trade = (await response.json()) as { id: string };
			toast.success(mode === 'create' ? 'Trade created.' : 'Trade updated.');
			window.location.assign(`/app/trades/${trade.id}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not save this trade.';
			setSubmitError(message);
			toast.error(message);
		}
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
			<TradeFormDetailsSection register={register} control={control} errors={errors} watch={watch} options={options} />
			<TradeFormPricingSection register={register} errors={errors} watch={watch} />
			<TradeFormJournalSection register={register} errors={errors} />

			{submitError ? (
				<p className="text-sm text-danger" role="alert">
					{submitError}
				</p>
			) : null}

			<div className="flex items-center justify-end gap-3">
				<Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="gap-2">
					{isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
					{mode === 'create' ? 'Create Trade' : 'Save Changes'}
				</Button>
			</div>
		</form>
	);
}
