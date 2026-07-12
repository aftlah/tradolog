import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	FormField,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from '@shared/components';
import { GOALS_API_ROUTE, GOAL_STATUS_OPTIONS, MONTH_OPTIONS } from '../constants/goals.constants';
import { buildGoalFormDefaults } from '../utils/form-defaults';
import { goalFormSchema, type GoalFormInput, type GoalFormValues } from '../validators/goal-schemas';
import type { GoalDto } from '../types/goals.types';

interface GoalFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	goal: GoalDto | null;
	onSaved: () => void;
}


export function GoalFormDialog({ open, onOpenChange, goal, onSaved }: GoalFormDialogProps) {
	const mode = goal ? 'edit' : 'create';
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<GoalFormInput, unknown, GoalFormValues>({
		resolver: zodResolver(goalFormSchema),
		defaultValues: buildGoalFormDefaults(goal),
	});

	useEffect(() => {
		if (open) {
			reset(buildGoalFormDefaults(goal));
		}
	}, [open, goal, reset]);

	async function onSubmit(values: GoalFormValues) {
		try {
			const url = mode === 'create' ? GOALS_API_ROUTE : `${GOALS_API_ROUTE}/${goal?.id}`;
			const response = await fetch(url, {
				method: mode === 'create' ? 'POST' : 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not save this goal.');
			}

			toast.success(mode === 'create' ? 'Goal created.' : 'Goal updated.');
			onSaved();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not save this goal.');
		}
	}

	return (
		<Dialog open={open} onOpenChange={(next) => (isSubmitting ? null : onOpenChange(next))}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>{mode === 'create' ? 'New Monthly Goal' : 'Edit Goal'}</DialogTitle>
					<DialogDescription>Set your targets — progress is tracked automatically from your closed trades.</DialogDescription>
				</DialogHeader>

				<form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
					<div className="grid gap-4 sm:grid-cols-2">
						<FormField id="month" label="Month" error={errors.month?.message}>
							<Controller
								name="month"
								control={control}
								render={({ field }) => (
									<Select value={field.value ? String(field.value) : undefined} onValueChange={(value) => field.onChange(Number(value))}>
										<SelectTrigger id="month">
											<SelectValue placeholder="Select month" />
										</SelectTrigger>
										<SelectContent>
											{MONTH_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={String(option.value)}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</FormField>

						<FormField id="year" label="Year" error={errors.year?.message}>
							<Input id="year" type="number" aria-invalid={Boolean(errors.year)} {...register('year')} />
						</FormField>
					</div>

					<FormField id="title" label="Title" error={errors.title?.message}>
						<Input id="title" placeholder="e.g. Consistent Execution" aria-invalid={Boolean(errors.title)} {...register('title')} />
					</FormField>

					<FormField id="description" label="Description" optional error={errors.description?.message}>
						<Textarea id="description" rows={3} placeholder="What are you focused on this month?" {...register('description')} />
					</FormField>

					<div className="grid gap-4 sm:grid-cols-2">
						<FormField id="targetProfit" label="Target Profit" optional hint="In your account currency." error={errors.targetProfit?.message}>
							<Input id="targetProfit" type="number" step="0.01" placeholder="e.g. 1000" {...register('targetProfit')} />
						</FormField>

						<FormField id="targetWinRate" label="Target Win Rate %" optional error={errors.targetWinRate?.message}>
							<Input id="targetWinRate" type="number" step="0.1" min={0} max={100} placeholder="e.g. 60" {...register('targetWinRate')} />
						</FormField>

						<FormField id="targetTradeCount" label="Target Trade Count" optional error={errors.targetTradeCount?.message}>
							<Input id="targetTradeCount" type="number" step="1" min={0} placeholder="e.g. 20" {...register('targetTradeCount')} />
						</FormField>

						<FormField
							id="maxDrawdownPercent"
							label="Max Drawdown %"
							optional
							hint="Your risk limit for the month."
							error={errors.maxDrawdownPercent?.message}
						>
							<Input id="maxDrawdownPercent" type="number" step="0.1" min={0} max={100} placeholder="e.g. 10" {...register('maxDrawdownPercent')} />
						</FormField>
					</div>

					<FormField id="status" label="Status" error={errors.status?.message}>
						<Controller
							name="status"
							control={control}
							render={({ field }) => (
								<Select value={field.value ? String(field.value) : undefined} onValueChange={field.onChange}>
									<SelectTrigger id="status">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										{GOAL_STATUS_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</FormField>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="gap-2">
							{isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
							{mode === 'create' ? 'Create Goal' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
