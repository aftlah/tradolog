import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Checkbox, FormField, Input, Label } from '@shared/components';
import { SETTINGS_RISK_API_ROUTE, RISK_SETTINGS_HINT } from '@features/risk/constants/risk.constants';
import { riskRulesFormSchema, type RiskRulesFormInput, type RiskRulesFormValues } from '@features/risk/validators/risk-schemas';
import type { RiskRulesDto } from '@features/risk/types/risk.types';

interface RiskRulesSettingsFormProps {
	rules: RiskRulesDto;
}

function toFormDefaults(rules: RiskRulesDto): RiskRulesFormInput {
	return {
		enabled: rules.enabled,
		maxDailyLossAmount: rules.maxDailyLossAmount !== null ? String(rules.maxDailyLossAmount) : '',
		maxDailyLossPercent: rules.maxDailyLossPercent !== null ? String(rules.maxDailyLossPercent) : '',
		maxWeeklyLossAmount: rules.maxWeeklyLossAmount !== null ? String(rules.maxWeeklyLossAmount) : '',
		maxWeeklyLossPercent: rules.maxWeeklyLossPercent !== null ? String(rules.maxWeeklyLossPercent) : '',
		maxTradesPerDay: rules.maxTradesPerDay !== null ? String(rules.maxTradesPerDay) : '',
		maxConsecutiveLosses: rules.maxConsecutiveLosses !== null ? String(rules.maxConsecutiveLosses) : '',
	};
}

/** Standing risk limits form — alerted on the Dashboard when breached. */
export function RiskRulesSettingsForm({ rules }: RiskRulesSettingsFormProps) {
	const [saved, setSaved] = useState(rules);
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<RiskRulesFormInput, unknown, RiskRulesFormValues>({
		resolver: zodResolver(riskRulesFormSchema),
		defaultValues: toFormDefaults(rules),
	});

	async function onSubmit(values: RiskRulesFormValues) {
		try {
			const response = await fetch(SETTINGS_RISK_API_ROUTE, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not save risk rules.');
			}

			const updated = (await response.json()) as RiskRulesDto;
			setSaved(updated);
			reset(toFormDefaults(updated));
			toast.success('Risk rules updated.');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not save risk rules.');
		}
	}

	function onInvalid() {
		toast.error('Please fix the highlighted fields before saving.');
	}

	return (
		<form
			className="glass-card space-y-6 p-6"
			method="post"
			action="#"
			onSubmit={(event) => {
				event.preventDefault();
				void handleSubmit(onSubmit, onInvalid)(event);
			}}
			noValidate
		>
			<div className="flex items-start gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
					<ShieldAlert className="size-5" aria-hidden="true" />
				</div>
				<div>
					<h2 className="text-sm font-medium text-muted">Risk Rules &amp; Alerts</h2>
					<p className="mt-1 text-xs text-muted">{RISK_SETTINGS_HINT}</p>
				</div>
			</div>

			<Controller
				name="enabled"
				control={control}
				render={({ field }) => (
					<label className="flex items-center gap-2 text-sm text-muted">
						<Checkbox
							checked={field.value === true}
							onCheckedChange={(checked) => field.onChange(checked === true)}
						/>
						<Label className="cursor-pointer font-normal text-foreground">Enable risk alerts on Dashboard</Label>
					</label>
				)}
			/>

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField
					id="maxDailyLossAmount"
					label="Max Daily Loss (amount)"
					optional
					hint="Absolute loss in account currency."
					error={errors.maxDailyLossAmount?.message as string | undefined}
				>
					<Input id="maxDailyLossAmount" inputMode="decimal" placeholder="e.g. 500000" {...register('maxDailyLossAmount')} />
				</FormField>

				<FormField
					id="maxDailyLossPercent"
					label="Max Daily Loss %"
					optional
					hint="% of starting balance."
					error={errors.maxDailyLossPercent?.message as string | undefined}
				>
					<Input id="maxDailyLossPercent" inputMode="decimal" placeholder="e.g. 2" {...register('maxDailyLossPercent')} />
				</FormField>

				<FormField
					id="maxWeeklyLossAmount"
					label="Max Weekly Loss (amount)"
					optional
					error={errors.maxWeeklyLossAmount?.message as string | undefined}
				>
					<Input id="maxWeeklyLossAmount" inputMode="decimal" placeholder="e.g. 1500000" {...register('maxWeeklyLossAmount')} />
				</FormField>

				<FormField
					id="maxWeeklyLossPercent"
					label="Max Weekly Loss %"
					optional
					error={errors.maxWeeklyLossPercent?.message as string | undefined}
				>
					<Input id="maxWeeklyLossPercent" inputMode="decimal" placeholder="e.g. 5" {...register('maxWeeklyLossPercent')} />
				</FormField>

				<FormField
					id="maxTradesPerDay"
					label="Max Closed Trades / Day"
					optional
					error={errors.maxTradesPerDay?.message as string | undefined}
				>
					<Input id="maxTradesPerDay" type="number" step="1" min={1} placeholder="e.g. 5" {...register('maxTradesPerDay')} />
				</FormField>

				<FormField
					id="maxConsecutiveLosses"
					label="Max Consecutive Losses"
					optional
					hint="Current loss streak from newest closed trades."
					error={errors.maxConsecutiveLosses?.message as string | undefined}
				>
					<Input
						id="maxConsecutiveLosses"
						type="number"
						step="1"
						min={1}
						placeholder="e.g. 3"
						{...register('maxConsecutiveLosses')}
					/>
				</FormField>
			</div>

			<p className="text-xs text-muted">
				Leave a field empty to disable that rule. Warning appears at 80% of the limit; danger when the limit is reached.
			</p>

			<div className="flex items-center justify-end">
				<Button
					type="button"
					disabled={isSubmitting}
					aria-busy={isSubmitting}
					className="gap-2"
					onClick={() => void handleSubmit(onSubmit, onInvalid)()}
				>
					{isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
					Save Risk Rules
				</Button>
			</div>

			{saved.enabled ? null : (
				<p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning" role="status">
					Alerts are currently disabled.
				</p>
			)}
		</form>
	);
}
