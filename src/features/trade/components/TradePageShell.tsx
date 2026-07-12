import type { ReactNode } from 'react';
import { AppShell } from '@shared/components';
import { LogoutButton } from '@features/auth';
import type { AccountOption } from '@shared/types';

interface TradePageShellProps {
	title: string;
	accounts: AccountOption[];
	activeAccountId: string | null;
	userName: string;
	userEmail: string;
	children: ReactNode;
}

/**
 * Shared `AppShell` wrapper for the Create/Edit/Detail trade pages. Switching accounts from here
 * jumps back to the (filterable) Trade List scoped to the newly selected account, since these
 * single-trade pages have no per-account view of their own.
 */
export function TradePageShell({ title, accounts, activeAccountId, userName, userEmail, children }: TradePageShellProps) {
	return (
		<AppShell
			title={title}
			activeHref="/app/trades"
			userName={userName}
			userEmail={userEmail}
			accounts={accounts}
			activeAccountId={activeAccountId}
			onAccountChange={(accountId) => window.location.assign(`/app/trades?accountId=${accountId}`)}
			showQuickAdd={false}
			userMenuFooter={<LogoutButton className="w-full" />}
		>
			{children}
		</AppShell>
	);
}
