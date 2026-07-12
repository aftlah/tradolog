import { z } from 'zod';

const emailSchema = z
	.email({ error: 'Enter a valid email address.' })
	.max(255, 'Email is too long.');

const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters.')
	.max(128, 'Password must be at most 128 characters.');

export const loginSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	rememberMe: z.boolean(),
});

export const registerSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, 'Name must be at least 2 characters.')
			.max(80, 'Name is too long.'),
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword'],
	});

export const forgotPasswordSchema = z.object({
	email: emailSchema,
});

export const resetPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword'],
	});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
