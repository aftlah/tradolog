import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button, FormField, Input, Textarea } from '@shared/components';
import { cn } from '@shared/utils/cn';
import { SETTINGS_PROFILE_API_ROUTE, TIMEZONE_OPTIONS } from '../constants/settings.constants';
import { profileFormSchema, type ProfileFormInput, type ProfileFormValues } from '../validators/settings-schemas';
import type { ProfileSettingsDto } from '../types/settings.types';

interface ProfileSettingsFormProps {
	profile: ProfileSettingsDto;
}

const selectClassName = cn(
	'flex h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 pr-10 text-sm text-foreground shadow-soft backdrop-blur-md transition-colors duration-200',
	'focus-visible:outline-none focus-visible:border-primary/45 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring focus-visible:ring-offset-0',
	'disabled:cursor-not-allowed disabled:opacity-50',
);

function toFormDefaults(profile: ProfileSettingsDto): ProfileFormInput {
	return {
		displayName: profile.displayName ?? '',
		timezone: profile.timezone || 'UTC',
		baseCurrency: profile.baseCurrency || 'USD',
		riskPerTradePercent: profile.riskPerTradePercent !== null ? String(profile.riskPerTradePercent) : '',
		defaultRiskReward: profile.defaultRiskReward !== null ? String(profile.defaultRiskReward) : '',
		bio: profile.bio ?? '',
	};
}

function toApiPayload(values: ProfileFormValues): ProfileFormValues {
	return {
		...values,
		displayName: values.displayName?.trim() ? values.displayName.trim() : null,
		timezone: values.timezone.trim(),
		baseCurrency: values.baseCurrency.trim().toUpperCase(),
		bio: values.bio?.trim() ? values.bio.trim() : null,
		riskPerTradePercent:
			values.riskPerTradePercent === null || values.riskPerTradePercent === undefined
				? null
				: String(values.riskPerTradePercent),
		defaultRiskReward:
			values.defaultRiskReward === null || values.defaultRiskReward === undefined
				? null
				: String(values.defaultRiskReward),
	};
}

/** Trader-preferences form: display name, timezone, base currency, default risk settings, bio. */
export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
	const [savedProfile, setSavedProfile] = useState(profile);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<ProfileFormInput, unknown, ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: toFormDefaults(profile),
	});

	const timezoneOptions = useMemo(() => {
		const known = new Set<string>(TIMEZONE_OPTIONS.map((option) => option.value));
		const current = savedProfile.timezone?.trim();
		if (current && !known.has(current)) {
			return [{ value: current, label: current }, ...TIMEZONE_OPTIONS];
		}
		return [...TIMEZONE_OPTIONS];
	}, [savedProfile.timezone]);

	async function onSubmit(values: ProfileFormValues) {
		if (!isDirty) {
			toast.message('No changes to save.');
			return;
		}

		try {
			const response = await fetch(SETTINGS_PROFILE_API_ROUTE, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(toApiPayload(values)),
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

	function onInvalid() {
		toast.error('Please fix the highlighted fields before saving.');
	}

	return (
		<form className="glass-card space-y-6 p-6" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
			<div>
				<h2 className="text-sm font-medium text-muted">Trader Profile</h2>
				<p className="mt-1 text-xs text-muted">Personal details and default risk preferences.</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField id="displayName" label="Display Name" optional error={errors.displayName?.message as string | undefined}>
					<Input id="displayName" placeholder="Your name" {...register('displayName')} />
				</FormField>

				<FormField id="timezone" label="Timezone" error={errors.timezone?.message}>
					<div className="relative">
						<select
							id="timezone"
							aria-invalid={Boolean(errors.timezone)}
							className={selectClassName}
							{...register('timezone')}
						>
							{timezoneOptions.map((option) => (
								<option key={option.value} value={option.value} className="bg-surface text-foreground">
									{option.label}
								</option>
							))}
						</select>
						<ChevronDown
							className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted"
							aria-hidden="true"
						/>
					</div>
				</FormField>

				<FormField id="baseCurrency" label="Base Currency" hint="3-letter code, e.g. USD" error={errors.baseCurrency?.message}>
					<Input id="baseCurrency" maxLength={3} placeholder="USD" {...register('baseCurrency')} />
				</FormField>

				<FormField
					id="riskPerTradePercent"
					label="Default Risk % per Trade"
					optional
					error={errors.riskPerTradePercent?.message as string | undefined}
				>
					<Input id="riskPerTradePercent" inputMode="decimal" placeholder="1.00" {...register('riskPerTradePercent')} />
				</FormField>

				<FormField
					id="defaultRiskReward"
					label="Default Risk:Reward"
					optional
					error={errors.defaultRiskReward?.message as string | undefined}
				>
					<Input id="defaultRiskReward" inputMode="decimal" placeholder="2.00" {...register('defaultRiskReward')} />
				</FormField>
			</div>

			<FormField id="bio" label="Bio" optional hint="A short note about your trading style." error={errors.bio?.message as string | undefined}>
				<Textarea id="bio" rows={4} placeholder="Tell us about your trading approach…" {...register('bio')} />
			</FormField>

			<div className="flex items-center justify-end">
				{/* Always clickable — `!isDirty` used to disable the button and made Save feel broken. */}
				<Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="gap-2">
					{isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
					Save Profile
				</Button>
			</div>
		</form>
	);
}
