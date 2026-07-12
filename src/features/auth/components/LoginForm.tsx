import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Checkbox, Input, Label } from '@shared/components';
import { PasswordInput } from '@features/auth/components/PasswordInput';
import { AuthDivider } from '@features/auth/components/AuthDivider';
import { GoogleSignInButton } from '@features/auth/components/GoogleSignInButton';
import { loginWithEmail } from '@features/auth/services/auth-service';
import { loginSchema, type LoginInput } from '@features/auth/validators/auth-schemas';
import { AUTH_ROUTES } from '@features/auth/constants/auth.constants';
import { toUserFacingAuthMessage } from '@shared/lib/errors';

type LoginFormProps = {
	googleEnabled: boolean;
};

function resolvePostLoginPath(): string {
	if (typeof window === 'undefined') {
		return AUTH_ROUTES.appHome;
	}
	const next = new URLSearchParams(window.location.search).get('next');
	if (next && next.startsWith('/') && !next.startsWith('//')) {
		return next;
	}
	return AUTH_ROUTES.appHome;
}

export function LoginForm({ googleEnabled }: LoginFormProps) {
	const [submitting, setSubmitting] = useState(false);
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
			rememberMe: true,
		},
	});

	const rememberMe = watch('rememberMe');

	async function onSubmit(values: LoginInput) {
		setSubmitting(true);
		try {
			await loginWithEmail(values);
			toast.success('Welcome back.');
			window.location.assign(resolvePostLoginPath());
		} catch (error) {
			toast.error(toUserFacingAuthMessage(error));
			setSubmitting(false);
		}
	}

	return (
		<form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
			<div className="space-y-2">
				<Label htmlFor="login-email">Email</Label>
				<Input
					id="login-email"
					type="email"
					autoComplete="email"
					aria-invalid={Boolean(errors.email)}
					aria-describedby={errors.email ? 'login-email-error' : undefined}
					placeholder="you@example.com"
					{...register('email')}
				/>
				{errors.email ? (
					<p id="login-email-error" className="text-sm text-danger" role="alert">
						{errors.email.message}
					</p>
				) : null}
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between gap-3">
					<Label htmlFor="login-password">Password</Label>
					<a
						href={AUTH_ROUTES.forgotPassword}
						className="text-sm text-muted transition-colors hover:text-foreground"
					>
						Forgot Password
					</a>
				</div>
				<PasswordInput
					id="login-password"
					autoComplete="current-password"
					aria-invalid={Boolean(errors.password)}
					aria-describedby={errors.password ? 'login-password-error' : undefined}
					placeholder="••••••••"
					{...register('password')}
				/>
				{errors.password ? (
					<p id="login-password-error" className="text-sm text-danger" role="alert">
						{errors.password.message}
					</p>
				) : null}
			</div>

			<div className="flex items-center gap-2">
				<Checkbox
					id="remember-me"
					checked={rememberMe}
					onCheckedChange={(checked) => setValue('rememberMe', checked === true)}
					aria-describedby="remember-me-label"
				/>
				<Label id="remember-me-label" htmlFor="remember-me" className="cursor-pointer font-normal text-muted">
					Remember Me
				</Label>
			</div>

			<Button type="submit" className="w-full" disabled={submitting} aria-busy={submitting}>
				{submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
				Login
			</Button>

			{googleEnabled ? (
				<>
					<AuthDivider />
					<GoogleSignInButton enabled={googleEnabled} />
				</>
			) : null}

			<p className="text-center text-sm text-muted">
				Don&apos;t have an account?{' '}
				<a href={AUTH_ROUTES.register} className="font-medium text-foreground hover:text-primary">
					Register
				</a>
			</p>
		</form>
	);
}
