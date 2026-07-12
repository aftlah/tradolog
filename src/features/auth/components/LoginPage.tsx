import { AuthSplitShell } from '@features/auth/components/AuthSplitShell';
import { LoginForm } from '@features/auth/components/LoginForm';

type LoginPageProps = {
	googleEnabled: boolean;
};

export function LoginPage({ googleEnabled }: LoginPageProps) {
	return (
		<AuthSplitShell
			title="Welcome back"
			subtitle="Sign in to continue journaling your trades."
		>
			<LoginForm googleEnabled={googleEnabled} />
		</AuthSplitShell>
	);
}
