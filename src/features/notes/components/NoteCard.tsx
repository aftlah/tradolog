import { useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Pin, Trash2 } from 'lucide-react';
import {
	Button,
	ConfirmDialog,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	GlassCard,
} from '@shared/components';
import { formatDateTime } from '@shared/utils/format';
import { NOTES_API_ROUTE } from '../constants/notes.constants';
import type { NoteDto } from '../types/notes.types';

interface NoteCardProps {
	note: NoteDto;
	onEdit: () => void;
	onDeleted: () => void;
}

/** A single journal note card: pin indicator, tags, timestamp, and an edit/delete menu. */
export function NoteCard({ note, onEdit, onDeleted }: NoteCardProps) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const tags = note.tags
		?.split(',')
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0);

	async function handleDelete() {
		const response = await fetch(`${NOTES_API_ROUTE}/${note.id}`, { method: 'DELETE' });
		if (!response.ok) {
			toast.error('Could not delete this note. Please try again.');
			return;
		}
		toast.success('Note deleted.');
		onDeleted();
	}

	return (
		<GlassCard className="flex h-full flex-col gap-3">
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-1.5">
					{note.isPinned ? <Pin className="size-3.5 text-primary" aria-hidden="true" /> : null}
					<h3 className="text-sm font-semibold text-foreground">{note.title ?? 'Untitled note'}</h3>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" aria-label="Note actions">
							<MoreHorizontal className="size-4" aria-hidden="true" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onSelect={(event) => {
								event.preventDefault();
								onEdit();
							}}
						>
							<Pencil aria-hidden="true" /> Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							variant="destructive"
							onSelect={(event) => {
								event.preventDefault();
								setConfirmOpen(true);
							}}
						>
							<Trash2 aria-hidden="true" /> Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<p className="line-clamp-6 flex-1 whitespace-pre-wrap text-sm text-muted">{note.body}</p>

			{tags && tags.length > 0 ? (
				<div className="flex flex-wrap gap-1.5">
					{tags.map((tag) => (
						<span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-muted">
							{tag}
						</span>
					))}
				</div>
			) : null}

			<p className="text-xs text-muted/70">{formatDateTime(note.updatedAt)}</p>

			<ConfirmDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Delete this note?"
				description="This removes the journal note permanently. This action cannot be undone."
				onConfirm={handleDelete}
			/>
		</GlassCard>
	);
}
