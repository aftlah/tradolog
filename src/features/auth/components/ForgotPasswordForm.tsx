import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label } from '@shared/components';
import { requestPasswordResetEmail } from '@features/auth/services/auth-service';
import {
	forgotPasswordSchema,
	type ForgotPasswordInput,
} from '@features/auth/validators/auth-schemas';
import { AUTH_ROUTES } from '@features/auth/constants/auth.constants';
import { toUserFacingAuthMessage } from '@shared/lib/errors';

export function ForgotPasswordForm() {
	const [submitting, setSubmitting] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordInput>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: '' },
	});

	async function onSubmit(values: ForgotPasswordInput) {
		setSubmitting(true);
		try {
			await requestPasswordResetEmail(values);
			toast.success('If an account exists, a reset link has been sent.');
		} catch (error) {
			toast.error(toUserFacingAuthMessage(error));
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
			<div className="space-y-2">
				<Label htmlFor="forgot-email">Email</Label>
				<Input
					id="forgot-email"
					type="email"
					autoComplete="email"
					aria-invalid={Boolean(errors.email)}
					aria-describedby={errors.email ? 'forgot-email-error' : undefined}
					placeholder="you@example.com"
					{...register('email')}
				/>
				{errors.email ? (
					<p id="forgot-email-error" className="text-sm text-danger" role="alert">
						{errors.email.message}
					</p>
				) : null}
			</div>

			<Button type="submit" className="w-full" disabled={submitting} aria-busy={submitting}>
				{submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
				Send reset link
			</Button>

			<p className="text-center text-sm text-muted">
				Remembered your password?{' '}
				<a href={AUTH_ROUTES.login} className="font-medium text-foreground hover:text-primary">
					Login
				</a>
			</p>
		</form>
	);
}
