import { GlassCard, Skeleton } from '@shared/components';
import type { NoteDto } from '../types/notes.types';
import { NoteCard } from './NoteCard';

interface NotesListProps {
	notes: NoteDto[];
	isLoading: boolean;
	hasSearch: boolean;
	onEdit: (note: NoteDto) => void;
	onDeleted: () => void;
}

/** Card grid of journal notes (pinned first), already filtered/sorted by `useNotes`. */
export function NotesList({ notes, isLoading, hasSearch, onEdit, onDeleted }: NotesListProps) {
	if (isLoading && notes.length === 0) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<Skeleton key={index} className="h-48" />
				))}
			</div>
		);
	}

	if (notes.length === 0) {
		return (
			<GlassCard className="text-center">
				<p className="text-sm text-muted">
					{hasSearch ? 'No notes match your search.' : 'No journal notes yet. Write your first entry to get started.'}
				</p>
			</GlassCard>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{notes.map((note) => (
				<NoteCard key={note.id} note={note} onEdit={() => onEdit(note)} onDeleted={onDeleted} />
			))}
		</div>
	);
}
