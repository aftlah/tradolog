import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { NOTES_API_ROUTE } from '../constants/notes.constants';
import { buildNoteFormDefaults } from '../utils/form-defaults';
import { noteFormSchema, type NoteFormInput, type NoteFormValues } from '../validators/note-schemas';
import type { NoteDto } from '../types/notes.types';

interface NoteFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	note: NoteDto | null;
	onSaved: () => void;
}

/** Create/Edit dialog for a journal note — a single RHF + Zod form shared by both modes. */
export function NoteFormDialog({ open, onOpenChange, note, onSaved }: NoteFormDialogProps) {
	const mode = note ? 'edit' : 'create';
	const {
		register,
		watch,
		setValue,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<NoteFormInput, unknown, NoteFormValues>({
		resolver: zodResolver(noteFormSchema),
		defaultValues: buildNoteFormDefaults(note),
	});

	useEffect(() => {
		if (open) {
			reset(buildNoteFormDefaults(note));
		}
	}, [open, note, reset]);

	const isPinned = watch('isPinned');

	async function onSubmit(values: NoteFormValues) {
		try {
			const url = mode === 'create' ? NOTES_API_ROUTE : `${NOTES_API_ROUTE}/${note?.id}`;
			const response = await fetch(url, {
				method: mode === 'create' ? 'POST' : 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not save this note.');
			}

			toast.success(mode === 'create' ? 'Note created.' : 'Note updated.');
			onSaved();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not save this note.');
		}
	}

	return (
		<Dialog open={open} onOpenChange={(next) => (isSubmitting ? null : onOpenChange(next))}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>{mode === 'create' ? 'New Journal Note' : 'Edit Note'}</DialogTitle>
					<DialogDescription>Capture your thoughts, psychology, or lessons — separate from any single trade.</DialogDescription>
				</DialogHeader>

				<form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
					<FormField id="title" label="Title" optional error={errors.title?.message}>
						<Input id="title" placeholder="e.g. Weekly reflection" {...register('title')} />
					</FormField>

					<FormField id="body" label="Note" error={errors.body?.message}>
						<Textarea id="body" rows={6} placeholder="Write your note…" aria-invalid={Boolean(errors.body)} {...register('body')} />
					</FormField>

					<FormField id="tags" label="Tags" optional hint="Comma-separated, e.g. psychology, discipline" error={errors.tags?.message}>
						<Input id="tags" placeholder="e.g. psychology, discipline" {...register('tags')} />
					</FormField>

					<label className="flex items-center gap-2 text-sm text-muted">
						<Checkbox checked={isPinned} onCheckedChange={(checked) => setValue('isPinned', checked === true)} />
						<Label className="cursor-pointer font-normal">Pin this note</Label>
					</label>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="gap-2">
							{isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
							{mode === 'create' ? 'Create Note' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
