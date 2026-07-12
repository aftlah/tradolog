import { AuthSplitShell } from '@features/auth/components/AuthSplitShell';
import { ResetPasswordForm } from '@features/auth/components/ResetPasswordForm';

type ResetPasswordPageProps = {
	token: string | null;
	hasInvalidToken: boolean;
};

export function ResetPasswordPage({ token, hasInvalidToken }: ResetPasswordPageProps) {
	return (
		<AuthSplitShell
			title="Reset password"
			subtitle="Choose a new password for your Tradolog account."
		>
			<ResetPasswordForm token={token} hasInvalidToken={hasInvalidToken} />
		</AuthSplitShell>
	);
}
