import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button, FormField, Input, Textarea } from '@shared/components';
import { SHARING_API_ROUTE } from '../constants/sharing.constants';
import { inviteUrlFromToken } from '../utils/invite-url';
import {
	inviteMentorFormSchema,
	type InviteMentorFormInput,
	type InviteMentorFormValues,
} from '../validators/sharing-schemas';
import type { JournalShareDto } from '../types/sharing.types';

interface SharingInviteFormProps {
	onInvited: (share: JournalShareDto) => void;
}

/** Owner form — invite a mentor by email for read-only journal access. */
export function SharingInviteForm({ onInvited }: SharingInviteFormProps) {
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<InviteMentorFormInput, unknown, InviteMentorFormValues>({
		resolver: zodResolver(inviteMentorFormSchema),
		defaultValues: { mentorEmail: '', message: '' },
	});

	async function onSubmit(values: InviteMentorFormValues) {
		try {
			const response = await fetch(SHARING_API_ROUTE, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not send invite.');
			}
			const share = (await response.json()) as JournalShareDto;
			onInvited(share);
			reset({ mentorEmail: '', message: '' });
			const link = inviteUrlFromToken(share.inviteToken);
			toast.success('Mentor invite created. Copy the link to share it.');
			await navigator.clipboard.writeText(link).catch(() => undefined);
			setCopiedId(share.id);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not send invite.');
		}
	}

	return (
		<form
			className="space-y-4"
			method="post"
			action="#"
			onSubmit={(event) => {
				event.preventDefault();
				void handleSubmit(onSubmit)(event);
			}}
			noValidate
		>
			<div className="grid gap-4 sm:grid-cols-2">
				<FormField id="mentorEmail" label="Mentor email" error={errors.mentorEmail?.message}>
					<Input id="mentorEmail" type="email" placeholder="mentor@email.com" {...register('mentorEmail')} />
				</FormField>
				<FormField id="message" label="Note (optional)" error={errors.message?.message as string | undefined}>
					<Textarea id="message" rows={1} placeholder="What should they review?" {...register('message')} />
				</FormField>
			</div>
			<div className="flex items-center justify-between gap-3">
				{copiedId ? <p className="text-xs text-success">Invite link copied to clipboard.</p> : <span />}
				<Button type="button" disabled={isSubmitting} aria-busy={isSubmitting} className="gap-2" onClick={() => void handleSubmit(onSubmit)()}>
					{isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <UserPlus className="size-4" aria-hidden="true" />}
					Invite Mentor
				</Button>
			</div>
		</form>
	);
}
