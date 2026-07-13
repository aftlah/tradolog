import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/components';
import { softNavigate } from '@shared/utils/soft-navigate';
import { TRADES_API_ROUTE } from '../constants/trade.constants';
import { inferTradeSide } from '../utils/infer-trade-side';
import { tradeFormSchema, type TradeFormInput, type TradeFormValues } from '../validators/trade-schemas';
import type { TradeFormOptions } from '../types/trade.types';
import { TradeFormDetailsSection } from './TradeFormDetailsSection';
import { TradeFormPricingSection } from './TradeFormPricingSection';
import { TradeFormJournalSection } from './TradeFormJournalSection';
import { TradePlanPreview } from './TradePlanPreview';
import { TradeSetupImageFill } from './TradeSetupImageFill';

interface TradeFormProps {
	mode: 'create' | 'edit';
	tradeId?: string;
	options: TradeFormOptions;
	defaultValues: TradeFormInput;
}

export function TradeForm({ mode, tradeId, options, defaultValues }: TradeFormProps) {
	const [submitError, setSubmitError] = useState<string | null>(null);
	const {
		register,
		watch,
		setValue,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<TradeFormInput, unknown, TradeFormValues>({
		resolver: zodResolver(tradeFormSchema),
		defaultValues,
	});

	const entryPrice = watch('entryPrice');
	const stopLoss = watch('stopLoss');
	const takeProfit = watch('takeProfit');
	const side = watch('side');
	const inferredSide = inferTradeSide(entryPrice, stopLoss, takeProfit);

	useEffect(() => {
		if (!inferredSide || inferredSide === side) {
			return;
		}
		setValue('side', inferredSide, { shouldDirty: true, shouldValidate: true });
	}, [inferredSide, side, setValue]);

	async function onSubmit(values: TradeFormValues) {
		setSubmitError(null);
		const sideFromPrices = inferTradeSide(values.entryPrice, values.stopLoss, values.takeProfit);
		if (!sideFromPrices) {
			toast.error('Add Stop Loss or Take Profit so Side can be detected from Entry.');
			return;
		}

		const payload = { ...values, side: sideFromPrices };

		try {
			const url = mode === 'create' ? TRADES_API_ROUTE : `${TRADES_API_ROUTE}/${tradeId}`;
			const response = await fetch(url, {
				method: mode === 'create' ? 'POST' : 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const responsePayload = await response.json().catch(() => null);
				throw new Error(responsePayload?.error ?? 'Could not save this trade.');
			}

			const trade = (await response.json()) as { id: string };
			toast.success(mode === 'create' ? 'Trade created.' : 'Trade updated.');
			await softNavigate(`/app/trades/${trade.id}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not save this trade.';
			setSubmitError(message);
			toast.error(message);
		}
	}

	function onInvalid(formErrors: typeof errors) {
		const firstMessage = Object.values(formErrors)
			.map((error) => (error && typeof error === 'object' && 'message' in error ? String(error.message) : null))
			.find((message): message is string => Boolean(message));
		toast.error(firstMessage ?? 'Please fix the highlighted fields before saving.');
		const firstError = document.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]');
		firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
			<TradeSetupImageFill setValue={setValue} />
			<TradeFormDetailsSection
				register={register}
				errors={errors}
				watch={watch}
				options={options}
				inferredSide={inferredSide}
			/>
			<TradeFormPricingSection register={register} errors={errors} watch={watch} options={options} />
			<TradePlanPreview watch={watch} options={options} />
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
