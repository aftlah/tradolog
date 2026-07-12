import type { NoteDto } from '../types/notes.types';
import type { NoteFormInput } from '../validators/note-schemas';

/** Builds the RHF default values for the Create/Edit Note form from an existing note, or a blank note when creating. */
export function buildNoteFormDefaults(note: NoteDto | null): NoteFormInput {
	if (!note) {
		return { title: '', body: '', tags: '', isPinned: false };
	}

	return {
		title: note.title ?? '',
		body: note.body,
		tags: note.tags ?? '',
		isPinned: note.isPinned,
	};
}
