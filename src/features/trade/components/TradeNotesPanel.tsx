import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Pin, Plus, Trash2 } from 'lucide-react';
import { Button, Checkbox, Input, Label, Textarea } from '@shared/components';
import { formatDateTime } from '@shared/utils/format';
import { tradeNoteFormSchema, type TradeNoteFormInput, type TradeNoteFormValues } from '../validators/trade-schemas';
import { TRADES_API_ROUTE } from '../constants/trade.constants';
import type { TradeNoteDto } from '../types/trade.types';

interface TradeNotesPanelProps {
	tradeId: string;
	notes: TradeNoteDto[];
	onNotesChange: (notes: TradeNoteDto[]) => void;
}

/** Timestamped trade journal notes: add/pin/delete, sorted with pinned notes first. */
export function TradeNotesPanel({ tradeId, notes, onNotesChange }: TradeNotesPanelProps) {
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<TradeNoteFormInput, unknown, TradeNoteFormValues>({
		resolver: zodResolver(tradeNoteFormSchema),
		defaultValues: { title: '', body: '', isPinned: false },
	});

	const isPinned = watch('isPinned');

	async function onSubmit(values: TradeNoteFormValues) {
		try {
			const response = await fetch(`${TRADES_API_ROUTE}/${tradeId}/notes`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				throw new Error('Could not save this note.');
			}
			const note = (await response.json()) as TradeNoteDto;
			onNotesChange([note, ...notes]);
			reset({ title: '', body: '', isPinned: false });
			toast.success('Note added.');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not save this note.');
		}
	}

	async function handleDelete(noteId: string) {
		setDeletingId(noteId);
		try {
			const response = await fetch(`${TRADES_API_ROUTE}/${tradeId}/notes/${noteId}`, { method: 'DELETE' });
			if (!response.ok) {
				throw new Error('Could not delete this note.');
			}
			onNotesChange(notes.filter((note) => note.id !== noteId));
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not delete this note.');
		} finally {
			setDeletingId(null);
		}
	}

	const sortedNotes = [...notes].sort((a, b) => {
		if (a.isPinned !== b.isPinned) {
			return a.isPinned ? -1 : 1;
		}
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	return (
		<div className="glass-card p-6">
			<h2 className="mb-4 text-sm font-medium text-muted">Notes</h2>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
				<Input placeholder="Title (optional)" {...register('title')} />
				<Textarea placeholder="Write a note about this trade…" rows={3} {...register('body')} />
				{errors.body ? (
					<p className="text-sm text-danger" role="alert">
						{errors.body.message}
					</p>
				) : null}
				<div className="flex items-center justify-between">
					<label className="flex items-center gap-2 text-sm text-muted">
						<Checkbox checked={isPinned} onCheckedChange={(checked) => setValue('isPinned', checked === true)} />
						<Label className="cursor-pointer font-normal">Pin this note</Label>
					</label>
					<Button type="submit" size="sm" disabled={isSubmitting} aria-busy={isSubmitting} className="gap-1.5">
						{isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
						Add Note
					</Button>
				</div>
			</form>

			<div className="mt-6 space-y-3">
				{sortedNotes.length === 0 ? (
					<p className="py-4 text-center text-sm text-muted">No notes yet.</p>
				) : (
					sortedNotes.map((note) => (
						<div key={note.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
							<div className="flex items-start justify-between gap-2">
								<div className="flex items-center gap-1.5">
									{note.isPinned ? <Pin className="size-3.5 text-primary" aria-hidden="true" /> : null}
									{note.title ? <p className="text-sm font-medium text-foreground">{note.title}</p> : null}
								</div>
								<button
									type="button"
									onClick={() => handleDelete(note.id)}
									disabled={deletingId === note.id}
									className="text-muted transition-colors hover:text-danger disabled:opacity-50"
									aria-label="Delete note"
								>
									{deletingId === note.id ? (
										<Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
									) : (
										<Trash2 className="size-3.5" aria-hidden="true" />
									)}
								</button>
							</div>
							<p className="mt-2 whitespace-pre-wrap text-sm text-muted">{note.body}</p>
							<p className="mt-2 text-xs text-muted/70">{formatDateTime(note.createdAt)}</p>
						</div>
					))
				)}
			</div>
		</div>
	);
}
