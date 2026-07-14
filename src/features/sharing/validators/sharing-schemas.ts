import { z } from 'zod';

const emptyToNull = (value: unknown) => (value === '' ? null : value);

export const inviteMentorFormSchema = z.object({
	mentorEmail: z.string().trim().email('Enter a valid mentor email.').max(255),
	message: z.preprocess(emptyToNull, z.string().trim().max(1000).nullable().optional()),
});

export type InviteMentorFormValues = z.infer<typeof inviteMentorFormSchema>;
export type InviteMentorFormInput = z.input<typeof inviteMentorFormSchema>;
