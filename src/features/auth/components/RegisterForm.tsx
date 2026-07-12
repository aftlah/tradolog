import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label } from '@shared/components';
import { PasswordInput } from '@features/auth/components/PasswordInput';
import { AuthDivider } from '@features/auth/components/AuthDivider';
import { GoogleSignInButton } from '@features/auth/components/GoogleSignInButton';
import { registerWithEmail } from '@features/auth/services/auth-service';
import { registerSchema, type RegisterInput } from '@features/auth/validators/auth-schemas';
import { AUTH_ROUTES } from '@features/auth/constants/auth.constants';
import { toUserFacingAuthMessage } from '@shared/lib/errors';

type RegisterFormProps = {
	googleEnabled: boolean;
};

export function RegisterForm({ googleEnabled }: RegisterFormProps) {
	const [submitting, setSubmitting] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	async function onSubmit(values: RegisterInput) {
		setSubmitting(true);
		try {
			await registerWithEmail(values);
			toast.success('Account created.');
			window.location.assign(AUTH_ROUTES.appHome);
		} catch (error) {
			toast.error(toUserFacingAuthMessage(error));
			setSubmitting(false);
		}
	}

	return (
		<form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
			<div className="space-y-2">
				<Label htmlFor="register-name">Name</Label>
				<Input
					id="register-name"
					autoComplete="name"
					aria-invalid={Boolean(errors.name)}
					aria-describedby={errors.name ? 'register-name-error' : undefined}
					placeholder="Alex Trader"
					{...register('name')}
				/>
				{errors.name ? (
					<p id="register-name-error" className="text-sm text-danger" role="alert">
						{errors.name.message}
					</p>
				) : null}
			</div>

			<div className="space-y-2">
				<Label htmlFor="register-email">Email</Label>
				<Input
					id="register-email"
					type="email"
					autoComplete="email"
					aria-invalid={Boolean(errors.email)}
					aria-describedby={errors.email ? 'register-email-error' : undefined}
					placeholder="you@example.com"
					{...register('email')}
				/>
				{errors.email ? (
					<p id="register-email-error" className="text-sm text-danger" role="alert">
						{errors.email.message}
					</p>
				) : null}
			</div>

			<div className="space-y-2">
				<Label htmlFor="register-password">Password</Label>
				<PasswordInput
					id="register-password"
					autoComplete="new-password"
					aria-invalid={Boolean(errors.password)}
					aria-describedby={errors.password ? 'register-password-error' : undefined}
					placeholder="••••••••"
					{...register('password')}
				/>
				{errors.password ? (
					<p id="register-password-error" className="text-sm text-danger" role="alert">
						{errors.password.message}
					</p>
				) : null}
			</div>

			<div className="space-y-2">
				<Label htmlFor="register-confirm-password">Confirm Password</Label>
				<PasswordInput
					id="register-confirm-password"
					autoComplete="new-password"
					aria-invalid={Boolean(errors.confirmPassword)}
					aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined}
					placeholder="••••••••"
					{...register('confirmPassword')}
				/>
				{errors.confirmPassword ? (
					<p id="register-confirm-error" className="text-sm text-danger" role="alert">
						{errors.confirmPassword.message}
					</p>
				) : null}
			</div>

			<Button type="submit" className="w-full" disabled={submitting} aria-busy={submitting}>
				{submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
				Create account
			</Button>

			{googleEnabled ? (
				<>
					<AuthDivider />
					<GoogleSignInButton enabled={googleEnabled} />
				</>
			) : null}

			<p className="text-center text-sm text-muted">
				Already have an account?{' '}
				<a href={AUTH_ROUTES.login} className="font-medium text-foreground hover:text-primary">
					Login
				</a>
			</p>
		</form>
	);
}
