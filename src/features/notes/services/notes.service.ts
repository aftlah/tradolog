/**
 * NotesService
 *
 * Composes `journalNoteRepository` to implement the standalone Journal Notes CRUD flow.
 * `journalNoteInsertSchema`/`journalNoteUpdateSchema` (shared validators) are the source of
 * truth for the DB-ready shape — client input is never trusted as-is, even though the feature
 * form schema already mirrors them for the RHF resolver.
 *
 * UI → NotesService → JournalNoteRepository → Database
 */
import { NotFoundError } from '@shared/lib/errors';
import { parseOrThrow } from '@shared/lib/validation';
import { journalNoteRepository } from '@shared/repositories';
import { journalNoteInsertSchema, journalNoteUpdateSchema } from '@shared/validators';
import type { JournalNote } from '@shared/types';
import { noteFormSchema } from '../validators/note-schemas';
import type { NoteDto } from '../types/notes.types';

function toNoteDto(note: JournalNote): NoteDto {
	return {
		id: note.id,
		title: note.title,
		body: note.body,
		tags: note.tags,
		isPinned: note.isPinned,
		createdAt: note.createdAt.toISOString(),
		updatedAt: note.updatedAt.toISOString(),
	};
}

export class NotesService {
	/** Every journal note for `userId`, pinned notes first (see `JournalNoteRepository.listByUserId`). */
	async list(userId: string): Promise<NoteDto[]> {
		const notes = await journalNoteRepository.listByUserId(userId);
		return notes.map(toNoteDto);
	}

	async create(userId: string, input: unknown): Promise<NoteDto> {
		const form = parseOrThrow(noteFormSchema, input);
		const data = parseOrThrow(journalNoteInsertSchema, { ...form, userId });
		const note = await journalNoteRepository.insert(data);
		return toNoteDto(note);
	}

	async update(id: string, userId: string, input: unknown): Promise<NoteDto> {
		const form = parseOrThrow(noteFormSchema.partial(), input);
		const data = parseOrThrow(journalNoteUpdateSchema, form);
		const updated = await journalNoteRepository.updateForUser(id, userId, data);
		if (!updated) {
			throw new NotFoundError('Note not found.');
		}
		return toNoteDto(updated);
	}

	async remove(id: string, userId: string): Promise<void> {
		const deleted = await journalNoteRepository.softDeleteForUser(id, userId);
		if (!deleted) {
			throw new NotFoundError('Note not found.');
		}
	}
}

export const notesService = new NotesService();
