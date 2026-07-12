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
	Textarea,
} from '@shared/components';
import { cn } from '@shared/utils/cn';
import { SETTINGS_STRATEGIES_API_ROUTE, STRATEGY_COLOR_SWATCHES } from '../constants/settings.constants';
import { strategyFormSchema, type StrategyFormInput, type StrategyFormValues } from '../validators/settings-schemas';
import type { StrategySettingsDto } from '../types/settings.types';

interface StrategyFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	strategy: StrategySettingsDto | null;
	onSaved: (strategy: StrategySettingsDto) => void;
}

const EMPTY_DEFAULTS: StrategyFormInput = {
	name: '',
	description: '',
	rules: '',
	color: STRATEGY_COLOR_SWATCHES[0],
	isActive: true,
};

function toFormDefaults(strategy: StrategySettingsDto | null): StrategyFormInput {
	if (!strategy) {
		return EMPTY_DEFAULTS;
	}
	return {
		name: strategy.name,
		description: strategy.description ?? '',
		rules: strategy.rules ?? '',
		color: strategy.color ?? STRATEGY_COLOR_SWATCHES[0],
		isActive: strategy.isActive,
	};
}

/** Create/edit dialog for a strategy/playbook, shared by the "Add Strategy" and row-edit actions. */
export function StrategyFormDialog({ open, onOpenChange, strategy, onSaved }: StrategyFormDialogProps) {
	const mode = strategy ? 'edit' : 'create';
	const {
		register,
		control,
		watch,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<StrategyFormInput, unknown, StrategyFormValues>({
		resolver: zodResolver(strategyFormSchema),
		defaultValues: toFormDefaults(strategy),
	});

	useEffect(() => {
		if (open) {
			reset(toFormDefaults(strategy));
		}
	}, [open, strategy, reset]);

	const selectedColor = watch('color');

	async function onSubmit(values: StrategyFormValues) {
		try {
			const url = mode === 'create' ? SETTINGS_STRATEGIES_API_ROUTE : `${SETTINGS_STRATEGIES_API_ROUTE}/${strategy?.id}`;
			const response = await fetch(url, {
				method: mode === 'create' ? 'POST' : 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not save this strategy.');
			}

			const saved = (await response.json()) as StrategySettingsDto;
			onSaved(saved);
			toast.success(mode === 'create' ? 'Strategy created.' : 'Strategy updated.');
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not save this strategy.');
		}
	}

	return (
		<Dialog open={open} onOpenChange={(next) => (isSubmitting ? null : onOpenChange(next))}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>{mode === 'create' ? 'Add Strategy' : 'Edit Strategy'}</DialogTitle>
					<DialogDescription>Playbooks you can attach to trades when logging setups.</DialogDescription>
				</DialogHeader>

				<form className="max-h-[70vh] space-y-4 overflow-y-auto pr-1" onSubmit={handleSubmit(onSubmit)} noValidate>
					<FormField id="strategyName" label="Strategy Name" error={errors.name?.message}>
						<Input id="strategyName" placeholder="e.g. London Breakout" {...register('name')} />
					</FormField>

					<FormField id="strategyDescription" label="Description" optional error={errors.description?.message}>
						<Textarea id="strategyDescription" rows={3} placeholder="What is this setup?" {...register('description')} />
					</FormField>

					<FormField id="strategyRules" label="Rules" optional hint="Entry/exit criteria and checklist." error={errors.rules?.message}>
						<Textarea id="strategyRules" rows={4} placeholder="List the rules you follow for this strategy…" {...register('rules')} />
					</FormField>

					<FormField id="strategyColor" label="Color Tag" optional error={errors.color?.message}>
						<Controller
							name="color"
							control={control}
							render={({ field }) => (
								<div className="flex flex-wrap items-center gap-2">
									{STRATEGY_COLOR_SWATCHES.map((swatch) => (
										<button
											key={swatch}
											type="button"
											onClick={() => field.onChange(swatch)}
											className={cn(
												'size-7 rounded-full border-2 transition-transform duration-200',
												selectedColor === swatch ? 'scale-110 border-white/80' : 'border-transparent',
											)}
											style={{ backgroundColor: swatch }}
											aria-label={`Use color ${swatch}`}
										/>
									))}
									<Input
										id="strategyColor"
										value={String(field.value ?? '')}
										onChange={field.onChange}
										placeholder="#2563EB"
										className="w-28"
									/>
								</div>
							)}
						/>
					</FormField>

					<Controller
						name="isActive"
						control={control}
						render={({ field }) => (
							<label className="flex items-center gap-2 text-sm text-muted">
								<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
								<Label className="cursor-pointer font-normal">Active — available when logging trades</Label>
							</label>
						)}
					/>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="gap-2">
							{isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
							{mode === 'create' ? 'Create Strategy' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
