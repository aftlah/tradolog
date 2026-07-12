import { AuthSplitShell } from '@features/auth/components/AuthSplitShell';
import { RegisterForm } from '@features/auth/components/RegisterForm';

type RegisterPageProps = {
	googleEnabled: boolean;
};

export function RegisterPage({ googleEnabled }: RegisterPageProps) {
	return (
		<AuthSplitShell
			title="Create your account"
			subtitle="Start tracking performance with a clean trading journal."
		>
			<RegisterForm googleEnabled={googleEnabled} />
		</AuthSplitShell>
	);
}
