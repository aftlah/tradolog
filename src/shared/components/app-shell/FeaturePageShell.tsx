import type { ReactNode } from 'react';
import { AppShell } from '../app-shell/AppShell';
import type { AccountOption } from '@shared/types';

interface FeaturePageShellProps {
	title: string;
	activeHref: string;
	accounts: AccountOption[];
	activeAccountId: string | null;
	onAccountChange?: (accountId: string) => void;
	isLoadingAccount?: boolean;
	userName: string;
	userEmail: string;
	userMenuFooter: ReactNode;
	showQuickAdd?: boolean;
	children: ReactNode;
}

/**
 * Thin `AppShell` wrapper reused by every non-Dashboard feature page (Analytics, Calendar,
 * Goals, Notes, Settings, …). Account switching defaults to navigating to the same path with
 * `?accountId=` so each feature keeps its own scoped view without re-implementing chrome.
 */
export function FeaturePageShell({
	title,
	activeHref,
	accounts,
	activeAccountId,
	onAccountChange,
	isLoadingAccount,
	userName,
	userEmail,
	userMenuFooter,
	showQuickAdd = true,
	children,
}: FeaturePageShellProps) {
	return (
		<AppShell
			title={title}
			activeHref={activeHref}
			userName={userName}
			userEmail={userEmail}
			accounts={accounts}
			activeAccountId={activeAccountId}
			onAccountChange={
				onAccountChange ??
				((accountId) => {
					const url = new URL(window.location.href);
					url.searchParams.set('accountId', accountId);
					window.location.assign(url.toString());
				})
			}
			isLoadingAccount={isLoadingAccount}
			showQuickAdd={showQuickAdd}
			userMenuFooter={userMenuFooter}
		>
			{children}
		</AppShell>
	);
}
