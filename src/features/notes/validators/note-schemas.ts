import { z } from 'zod';
import { journalNoteInsertSchema } from '@shared/validators';

/** The Create/Edit Note form schema — the shared insert schema minus the server-assigned `userId`. */
export const noteFormSchema = journalNoteInsertSchema.omit({ userId: true });

export type NoteFormValues = z.infer<typeof noteFormSchema>;

/** Raw, pre-validation shape of every form control (native inputs only ever produce strings). */
export type NoteFormInput = z.input<typeof noteFormSchema>;
