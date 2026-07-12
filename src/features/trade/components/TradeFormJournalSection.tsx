import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FormField, Input, Textarea } from '@shared/components';
import type { TradeFormInput } from '../validators/trade-schemas';

interface TradeFormJournalSectionProps {
	register: UseFormRegister<TradeFormInput>;
	errors: FieldErrors<TradeFormInput>;
}

/** Freeform journaling fields: tags plus the setup / mistakes / lessons reflection prompts. */
export function TradeFormJournalSection({ register, errors }: TradeFormJournalSectionProps) {
	return (
		<div className="glass-card space-y-5 p-6">
			<h2 className="text-sm font-medium text-muted">Journal</h2>

			<FormField id="tags" label="Tags" optional hint="Comma-separated, e.g. breakout, news, revenge-trade" error={errors.tags?.message as string | undefined}>
				<Input id="tags" placeholder="breakout, news" {...register('tags')} />
			</FormField>

			<div className="grid gap-4 sm:grid-cols-3">
				<FormField id="setup" label="Setup" optional error={errors.setup?.message as string | undefined}>
					<Textarea id="setup" rows={4} placeholder="What was the setup / thesis?" {...register('setup')} />
				</FormField>

				<FormField id="mistakes" label="Mistakes" optional error={errors.mistakes?.message as string | undefined}>
					<Textarea id="mistakes" rows={4} placeholder="What went wrong?" {...register('mistakes')} />
				</FormField>

				<FormField id="lessons" label="Lessons" optional error={errors.lessons?.message as string | undefined}>
					<Textarea id="lessons" rows={4} placeholder="What will you do differently?" {...register('lessons')} />
				</FormField>
			</div>
		</div>
	);
}
