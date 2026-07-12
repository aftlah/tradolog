import { AuthSplitShell } from '@features/auth/components/AuthSplitShell';
import { ForgotPasswordForm } from '@features/auth/components/ForgotPasswordForm';

export function ForgotPasswordPage() {
	return (
		<AuthSplitShell
			title="Forgot password"
			subtitle="Enter your email and we’ll send a reset link."
		>
			<ForgotPasswordForm />
		</AuthSplitShell>
	);
}
