import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button, FeaturePageShell, Input } from '@shared/components';
import { LogoutButton } from '@features/auth/components/LogoutButton';
import type { AccountOption } from '@shared/types';
import { useNotes } from '../hooks/useNotes';
import type { NoteDto } from '../types/notes.types';
import { NoteFormDialog } from './NoteFormDialog';
import { NotesList } from './NotesList';

interface NotesShellProps {
	initialNotes: NoteDto[];
	accounts: AccountOption[];
	activeAccountId: string | null;
	userName: string;
	userEmail: string;
}

/** Top-level Notes orchestrator: owns the note list + Create/Edit dialog, renders `FeaturePageShell` chrome. */
export function NotesShell({ initialNotes, accounts, activeAccountId, userName, userEmail }: NotesShellProps) {
	const { notes, search, setSearch, isLoading, refetch } = useNotes(initialNotes);
	const [formOpen, setFormOpen] = useState(false);
	const [editingNote, setEditingNote] = useState<NoteDto | null>(null);

	function openCreateDialog() {
		setEditingNote(null);
		setFormOpen(true);
	}

	function openEditDialog(note: NoteDto) {
		setEditingNote(note);
		setFormOpen(true);
	}

	return (
		<FeaturePageShell
			title="Notes"
			activeHref="/app/notes"
			accounts={accounts}
			activeAccountId={activeAccountId}
			userName={userName}
			userEmail={userEmail}
			userMenuFooter={<LogoutButton className="w-full" />}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative w-full sm:max-w-xs">
					<Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
					<Input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search notes…"
						className="pl-10"
						aria-label="Search notes"
					/>
				</div>
				<Button onClick={openCreateDialog} className="gap-2">
					<Plus className="size-4" aria-hidden="true" />
					New Note
				</Button>
			</div>

			<NotesList notes={notes} isLoading={isLoading} hasSearch={search.trim().length > 0} onEdit={openEditDialog} onDeleted={refetch} />

			<NoteFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				note={editingNote}
				onSaved={() => {
					setFormOpen(false);
					void refetch();
				}}
			/>
		</FeaturePageShell>
	);
}
