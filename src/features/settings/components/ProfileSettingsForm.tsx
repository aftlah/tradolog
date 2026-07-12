import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
	Button,
	FormField,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from '@shared/components';
import { SETTINGS_PROFILE_API_ROUTE, TIMEZONE_OPTIONS } from '../constants/settings.constants';
import { profileFormSchema, type ProfileFormInput, type ProfileFormValues } from '../validators/settings-schemas';
import type { ProfileSettingsDto } from '../types/settings.types';

interface ProfileSettingsFormProps {
	profile: ProfileSettingsDto;
}

function toFormDefaults(profile: ProfileSettingsDto): ProfileFormInput {
	return {
		displayName: profile.displayName ?? '',
		timezone: profile.timezone,
		baseCurrency: profile.baseCurrency,
		riskPerTradePercent: profile.riskPerTradePercent !== null ? String(profile.riskPerTradePercent) : '',
		defaultRiskReward: profile.defaultRiskReward !== null ? String(profile.defaultRiskReward) : '',
		bio: profile.bio ?? '',
	};
}

/** Trader-preferences form: display name, timezone, base currency, default risk settings, bio. */
export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
	const [savedProfile, setSavedProfile] = useState(profile);
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<ProfileFormInput, unknown, ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: toFormDefaults(profile),
	});

	const timezoneOptions = useMemo(() => {
		const values = new Set<string>([savedProfile.timezone, ...TIMEZONE_OPTIONS]);
		return Array.from(values);
	}, [savedProfile.timezone]);

	async function onSubmit(values: ProfileFormValues) {
		try {
			const response = await fetch(SETTINGS_PROFILE_API_ROUTE, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not save your profile.');
			}

			const updated = (await response.json()) as ProfileSettingsDto;
			setSavedProfile(updated);
			reset(toFormDefaults(updated));
			toast.success('Profile updated.');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not save your profile.');
		}
	}

	return (
		<form className="glass-card space-y-6 p-6" onSubmit={handleSubmit(onSubmit)} noValidate>
			<div>
				<h2 className="text-sm font-medium text-muted">Trader Profile</h2>
				<p className="mt-1 text-xs text-muted">Personal details and default risk preferences.</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField id="displayName" label="Display Name" optional error={errors.displayName?.message}>
					<Input id="displayName" placeholder="Your name" {...register('displayName')} />
				</FormField>

				<FormField id="timezone" label="Timezone" error={errors.timezone?.message}>
					<Controller
						name="timezone"
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger id="timezone">
									<SelectValue placeholder="Select timezone" />
								</SelectTrigger>
								<SelectContent>
									{timezoneOptions.map((timezone) => (
										<SelectItem key={timezone} value={timezone}>
											{timezone}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</FormField>

				<FormField id="baseCurrency" label="Base Currency" hint="3-letter code, e.g. USD" error={errors.baseCurrency?.message}>
					<Input id="baseCurrency" maxLength={3} placeholder="USD" {...register('baseCurrency')} />
				</FormField>

				<FormField id="riskPerTradePercent" label="Default Risk % per Trade" optional error={errors.riskPerTradePercent?.message}>
					<Input id="riskPerTradePercent" type="number" step="0.01" placeholder="1.00" {...register('riskPerTradePercent')} />
				</FormField>

				<FormField id="defaultRiskReward" label="Default Risk:Reward" optional error={errors.defaultRiskReward?.message}>
					<Input id="defaultRiskReward" type="number" step="0.01" placeholder="2.00" {...register('defaultRiskReward')} />
				</FormField>
			</div>

			<FormField id="bio" label="Bio" optional hint="A short note about your trading style." error={errors.bio?.message}>
				<Textarea id="bio" rows={4} placeholder="Tell us about your trading approach…" {...register('bio')} />
			</FormField>

			<div className="flex items-center justify-end">
				<Button type="submit" disabled={isSubmitting || !isDirty} aria-busy={isSubmitting} className="gap-2">
					{isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
					Save Profile
				</Button>
			</div>
		</form>
	);
}
