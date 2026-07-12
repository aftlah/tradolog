import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useDebouncedValue } from '@shared/hooks';
import { NOTES_API_ROUTE } from '../constants/notes.constants';
import type { NoteDto } from '../types/notes.types';

interface UseNotesResult {
	notes: NoteDto[];
	search: string;
	setSearch: (value: string) => void;
	isLoading: boolean;
	refetch: () => Promise<void>;
}

function sortPinnedFirst(notes: NoteDto[]): NoteDto[] {
	return [...notes].sort((a, b) => {
		if (a.isPinned !== b.isPinned) {
			return a.isPinned ? -1 : 1;
		}
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});
}

function matchesSearch(note: NoteDto, term: string): boolean {
	if (!term) {
		return true;
	}
	return (
		(note.title?.toLowerCase().includes(term) ?? false) ||
		note.body.toLowerCase().includes(term) ||
		(note.tags?.toLowerCase().includes(term) ?? false)
	);
}

/** Owns the Notes list's client-side state: pinned-first ordering, debounced search, and refetch after create/update/delete. */
export function useNotes(initialNotes: NoteDto[]): UseNotesResult {
	const [rawNotes, setRawNotes] = useState<NoteDto[]>(initialNotes);
	const [search, setSearch] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const debouncedSearch = useDebouncedValue(search, 200);

	const refetch = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await fetch(NOTES_API_ROUTE);
			if (!response.ok) {
				throw new Error('Failed to load notes.');
			}
			const next = (await response.json()) as NoteDto[];
			setRawNotes(next);
		} catch {
			toast.error('Could not load notes. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}, []);

	const notes = useMemo(() => {
		const term = debouncedSearch.trim().toLowerCase();
		return sortPinnedFirst(rawNotes).filter((note) => matchesSearch(note, term));
	}, [rawNotes, debouncedSearch]);

	return { notes, search, setSearch, isLoading, refetch };
}
