/** Ready-to-render journal note payload — standalone psychology/trading notes, not tied to a single trade. */
export interface NoteDto {
	id: string;
	title: string | null;
	body: string;
	tags: string | null;
	isPinned: boolean;
	createdAt: string;
	updatedAt: string;
}
