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
	Textarea,
} from '@shared/components';
import { ACCOUNT_TYPE_OPTIONS, SETTINGS_ACCOUNTS_API_ROUTE } from '../constants/settings.constants';
import { accountFormSchema, type AccountFormInput, type AccountFormValues } from '../validators/settings-schemas';
import type { AccountSettingsDto } from '../types/settings.types';

interface AccountFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	account: AccountSettingsDto | null;
	onSaved: (account: AccountSettingsDto) => void;
}

const EMPTY_DEFAULTS: AccountFormInput = {
	name: '',
	broker: '',
	accountType: 'demo',
	currency: 'USD',
	startingBalance: '0',
	leverage: '',
	quoteToAccountRate: '',
	isDefault: false,
	notes: '',
};

function toFormDefaults(account: AccountSettingsDto | null): AccountFormInput {
	if (!account) {
		return EMPTY_DEFAULTS;
	}
	return {
		name: account.name,
		broker: account.broker ?? '',
		accountType: account.accountType,
		currency: account.currency,
		startingBalance: String(account.startingBalance),
		leverage: account.leverage !== null ? String(account.leverage) : '',
		quoteToAccountRate: account.quoteToAccountRate !== null ? String(account.quoteToAccountRate) : '',
		isDefault: account.isDefault,
		notes: account.notes ?? '',
	};
}

/** Create/edit dialog for a trading account, shared by the "Add Account" and row-edit actions. */
export function AccountFormDialog({ open, onOpenChange, account, onSaved }: AccountFormDialogProps) {
	const mode = account ? 'edit' : 'create';
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<AccountFormInput, unknown, AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues: toFormDefaults(account),
	});

	useEffect(() => {
		if (open) {
			reset(toFormDefaults(account));
		}
	}, [open, account, reset]);

	async function onSubmit(values: AccountFormValues) {
		try {
			const url = mode === 'create' ? SETTINGS_ACCOUNTS_API_ROUTE : `${SETTINGS_ACCOUNTS_API_ROUTE}/${account?.id}`;
			const response = await fetch(url, {
				method: mode === 'create' ? 'POST' : 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not save this account.');
			}

			const saved = (await response.json()) as AccountSettingsDto;
			onSaved(saved);
			toast.success(mode === 'create' ? 'Account created.' : 'Account updated.');
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not save this account.');
		}
	}

	return (
		<Dialog open={open} onOpenChange={(next) => (isSubmitting ? null : onOpenChange(next))}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>{mode === 'create' ? 'Add Trading Account' : 'Edit Trading Account'}</DialogTitle>
					<DialogDescription>Accounts track balances and scope your trades independently.</DialogDescription>
				</DialogHeader>

				<form className="max-h-[70vh] space-y-4 overflow-y-auto px-0.5 py-0.5" onSubmit={handleSubmit(onSubmit)} noValidate>
					<div className="grid gap-4 sm:grid-cols-2">
						<FormField id="name" label="Account Name" error={errors.name?.message}>
							<Input id="name" placeholder="Main FTMO Account" {...register('name')} />
						</FormField>

						<FormField id="broker" label="Broker" optional error={errors.broker?.message}>
							<Input id="broker" placeholder="e.g. IC Markets" {...register('broker')} />
						</FormField>

						<FormField id="accountType" label="Account Type" error={errors.accountType?.message}>
							<Controller
								name="accountType"
								control={control}
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger id="accountType">
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											{ACCOUNT_TYPE_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</FormField>

						<FormField id="currency" label="Currency" hint="3-letter code" error={errors.currency?.message}>
							<Input id="currency" maxLength={3} placeholder="USD" {...register('currency')} />
						</FormField>

						<FormField
							id="startingBalance"
							label="Starting Balance"
							hint="Saldo MT5 sebelum trade pertama yang kamu log di Tradolog. Balance = starting + P&L trade closed."
							error={errors.startingBalance?.message}
						>
							<Input id="startingBalance" type="number" step="0.01" {...register('startingBalance')} />
						</FormField>

						{account ? (
							<FormField id="currentBalance" label="Current Balance" hint="Starting + closed trades P&L (read-only)">
								<Input
									id="currentBalance"
									type="text"
									readOnly
									disabled
									value={String(account.currentBalance)}
								/>
							</FormField>
						) : null}

						<FormField id="leverage" label="Leverage" optional hint="e.g. 100 for 1:100 (margin only, not P&L)" error={errors.leverage?.message}>
							<Input id="leverage" type="number" step="1" placeholder="100" {...register('leverage')} />
						</FormField>

						<FormField
							id="quoteToAccountRate"
							label="USD → Account Rate"
							optional
							hint="Wajib untuk akun IDR: kurs 1 USD ≈ Rp (lihat MT5 / broker). Contoh: 18050. Trade XAUUSD pakai rate ini agar P&L cocok MT5."
							error={errors.quoteToAccountRate?.message}
						>
							<Input id="quoteToAccountRate" inputMode="decimal" placeholder="18050" {...register('quoteToAccountRate')} />
						</FormField>

						<div className="flex items-end pb-2 sm:col-span-2">
							<Controller
								name="isDefault"
								control={control}
								render={({ field }) => (
									<label className="flex items-center gap-2 text-sm text-muted">
										<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
										<Label className="cursor-pointer font-normal">Set as default account</Label>
									</label>
								)}
							/>
						</div>
					</div>

					<FormField id="notes" label="Notes" optional error={errors.notes?.message}>
						<Textarea id="notes" rows={3} placeholder="Rules, restrictions, or reminders for this account…" {...register('notes')} />
					</FormField>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="gap-2">
							{isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
							{mode === 'create' ? 'Create Account' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
