import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Label } from '@shared/components';
import { PasswordInput } from '@features/auth/components/PasswordInput';
import { resetPasswordWithToken } from '@features/auth/services/auth-service';
import {
	resetPasswordSchema,
	type ResetPasswordInput,
} from '@features/auth/validators/auth-schemas';
import { AUTH_ROUTES } from '@features/auth/constants/auth.constants';
import { toUserFacingAuthMessage } from '@shared/lib/errors';

type ResetPasswordFormProps = {
	token: string | null;
	hasInvalidToken: boolean;
};

export function ResetPasswordForm({ token, hasInvalidToken }: ResetPasswordFormProps) {
	const [submitting, setSubmitting] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordInput>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	});

	if (hasInvalidToken || !token) {
		return (
			<div className="space-y-4 text-center">
				<p className="text-sm text-danger" role="alert">
					This reset link is invalid or has expired.
				</p>
				<a href={AUTH_ROUTES.forgotPassword} className="text-sm font-medium text-foreground hover:text-primary">
					Request a new link
				</a>
			</div>
		);
	}

	async function onSubmit(values: ResetPasswordInput) {
		if (!token) {
			return;
		}

		setSubmitting(true);
		try {
			await resetPasswordWithToken(values, token);
			toast.success('Password updated. You can sign in now.');
			window.location.assign(AUTH_ROUTES.login);
		} catch (error) {
			toast.error(toUserFacingAuthMessage(error));
			setSubmitting(false);
		}
	}

	return (
		<form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
			<div className="space-y-2">
				<Label htmlFor="reset-password">New Password</Label>
				<PasswordInput
					id="reset-password"
					autoComplete="new-password"
					aria-invalid={Boolean(errors.password)}
					aria-describedby={errors.password ? 'reset-password-error' : undefined}
					placeholder="••••••••"
					{...register('password')}
				/>
				{errors.password ? (
					<p id="reset-password-error" className="text-sm text-danger" role="alert">
						{errors.password.message}
					</p>
				) : null}
			</div>

			<div className="space-y-2">
				<Label htmlFor="reset-confirm-password">Confirm Password</Label>
				<PasswordInput
					id="reset-confirm-password"
					autoComplete="new-password"
					aria-invalid={Boolean(errors.confirmPassword)}
					aria-describedby={errors.confirmPassword ? 'reset-confirm-error' : undefined}
					placeholder="••••••••"
					{...register('confirmPassword')}
				/>
				{errors.confirmPassword ? (
					<p id="reset-confirm-error" className="text-sm text-danger" role="alert">
						{errors.confirmPassword.message}
					</p>
				) : null}
			</div>

			<Button type="submit" className="w-full" disabled={submitting} aria-busy={submitting}>
				{submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
				Reset password
			</Button>
		</form>
	);
}
