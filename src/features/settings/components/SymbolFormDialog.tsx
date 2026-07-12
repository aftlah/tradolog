import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
	Button,
	Checkbox,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	FormField,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@shared/components';
import { MARKET_TYPE_OPTIONS, SETTINGS_SYMBOLS_API_ROUTE } from '../constants/settings.constants';
import { symbolFormSchema, type SymbolFormInput, type SymbolFormValues } from '../validators/settings-schemas';
import type { SymbolSettingsDto } from '../types/settings.types';

interface SymbolFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	symbol: SymbolSettingsDto | null;
	onSaved: (symbol: SymbolSettingsDto) => void;
}

const EMPTY_DEFAULTS: SymbolFormInput = {
	ticker: '',
	name: '',
	marketType: 'forex',
	baseAsset: '',
	quoteAsset: '',
	pipSize: '',
	pricePrecision: 5,
	isActive: true,
};

function toFormDefaults(symbol: SymbolSettingsDto | null): SymbolFormInput {
	if (!symbol) {
		return EMPTY_DEFAULTS;
	}
	return {
		ticker: symbol.ticker,
		name: symbol.name,
		marketType: symbol.marketType,
		baseAsset: symbol.baseAsset ?? '',
		quoteAsset: symbol.quoteAsset ?? '',
		pipSize: symbol.pipSize !== null ? String(symbol.pipSize) : '',
		pricePrecision: symbol.pricePrecision,
		isActive: symbol.isActive,
	};
}

/** Create/edit dialog for a user-owned custom symbol (the shared/system catalog is read-only). */
export function SymbolFormDialog({ open, onOpenChange, symbol, onSaved }: SymbolFormDialogProps) {
	const mode = symbol ? 'edit' : 'create';
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<SymbolFormInput, unknown, SymbolFormValues>({
		resolver: zodResolver(symbolFormSchema),
		defaultValues: toFormDefaults(symbol),
	});

	useEffect(() => {
		if (open) {
			reset(toFormDefaults(symbol));
		}
	}, [open, symbol, reset]);

	async function onSubmit(values: SymbolFormValues) {
		try {
			const url = mode === 'create' ? SETTINGS_SYMBOLS_API_ROUTE : `${SETTINGS_SYMBOLS_API_ROUTE}/${symbol?.id}`;
			const response = await fetch(url, {
				method: mode === 'create' ? 'POST' : 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not save this symbol.');
			}

			const saved = (await response.json()) as SymbolSettingsDto;
			onSaved(saved);
			toast.success(mode === 'create' ? 'Symbol created.' : 'Symbol updated.');
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not save this symbol.');
		}
	}

	return (
		<Dialog open={open} onOpenChange={(next) => (isSubmitting ? null : onOpenChange(next))}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>{mode === 'create' ? 'Add Symbol' : 'Edit Symbol'}</DialogTitle>
					<DialogDescription>Custom instruments for the trades you log — only your own symbols can be edited.</DialogDescription>
				</DialogHeader>

				<form className="max-h-[70vh] space-y-4 overflow-y-auto pr-1" onSubmit={handleSubmit(onSubmit)} noValidate>
					<div className="grid gap-4 sm:grid-cols-2">
						<FormField id="ticker" label="Ticker" error={errors.ticker?.message}>
							<Input id="ticker" placeholder="e.g. EURUSD" {...register('ticker')} />
						</FormField>

						<FormField id="symbolName" label="Name" error={errors.name?.message}>
							<Input id="symbolName" placeholder="Euro / US Dollar" {...register('name')} />
						</FormField>

						<FormField id="marketType" label="Market Type" error={errors.marketType?.message}>
							<Controller
								name="marketType"
								control={control}
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger id="marketType">
											<SelectValue placeholder="Select market" />
										</SelectTrigger>
										<SelectContent>
											{MARKET_TYPE_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</FormField>

						<FormField id="pricePrecision" label="Price Precision" hint="Decimal places, e.g. 5" error={errors.pricePrecision?.message}>
							<Input id="pricePrecision" type="number" step="1" min={0} max={12} {...register('pricePrecision')} />
						</FormField>

						<FormField id="baseAsset" label="Base Asset" optional error={errors.baseAsset?.message}>
							<Input id="baseAsset" placeholder="EUR" {...register('baseAsset')} />
						</FormField>

						<FormField id="quoteAsset" label="Quote Asset" optional error={errors.quoteAsset?.message}>
							<Input id="quoteAsset" placeholder="USD" {...register('quoteAsset')} />
						</FormField>

						<FormField id="pipSize" label="Pip Size" optional hint="e.g. 0.0001" error={errors.pipSize?.message}>
							<Input id="pipSize" type="number" step="0.00001" placeholder="0.0001" {...register('pipSize')} />
						</FormField>

						<div className="flex items-end pb-2">
							<Controller
								name="isActive"
								control={control}
								render={({ field }) => (
									<label className="flex items-center gap-2 text-sm text-muted">
										<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
										<Label className="cursor-pointer font-normal">Active — selectable when logging trades</Label>
									</label>
								)}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="gap-2">
							{isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
							{mode === 'create' ? 'Create Symbol' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
