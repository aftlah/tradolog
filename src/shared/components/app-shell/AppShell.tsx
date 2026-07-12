import { useState, type ReactNode } from 'react';
import { NAV_ITEMS } from '@shared/constants/nav.constants';
import type { AccountOption } from '@shared/types';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface AppShellProps {
	title: string;
	activeHref: string;
	userName: string;
	userEmail: string;
	accounts: AccountOption[];
	activeAccountId: string | null;
	onAccountChange: (accountId: string) => void;
	isLoadingAccount?: boolean;
	showQuickAdd?: boolean;
	/** Feature-owned logout control (see `Navbar`); keeps this shared shell free of feature imports. */
	userMenuFooter: ReactNode;
	children: ReactNode;
}

/**
 * Authenticated app chrome shared by every feature page (Dashboard, Trades, and beyond):
 * floating sidebar + fixed navbar, with a content slot for feature-specific UI. Keeping this in
 * `shared` — instead of duplicated per feature — is what lets each feature page stay focused on
 * its own data instead of re-implementing navigation.
 */
export function AppShell({
	title,
	activeHref,
	userName,
	userEmail,
	accounts,
	activeAccountId,
	onAccountChange,
	isLoadingAccount,
	showQuickAdd,
	userMenuFooter,
	children,
}: AppShellProps) {
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	return (
		<div className="relative min-h-dvh">
			<div
				aria-hidden="true"
				className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(37_99_235_/_0.14),_transparent_55%)]"
			/>

			<Sidebar
				navItems={NAV_ITEMS}
				activeHref={activeHref}
				mobileOpen={mobileNavOpen}
				onMobileOpenChange={setMobileNavOpen}
			/>

			<div className="relative z-10 lg:pl-[18rem]">
				{/* Fixed floating top bar — stays put while page content scrolls underneath. */}
				<div className="pointer-events-none fixed inset-x-0 top-0 z-30 px-4 pt-4 lg:left-[18rem] lg:pr-4">
					<div className="pointer-events-auto">
						<Navbar
							title={title}
							userName={userName}
							userEmail={userEmail}
							accounts={accounts}
							activeAccountId={activeAccountId}
							onAccountChange={onAccountChange}
							onOpenMobileNav={() => setMobileNavOpen(true)}
							isLoadingAccount={isLoadingAccount}
							showQuickAdd={showQuickAdd}
							userMenuFooter={userMenuFooter}
						/>
					</div>
				</div>

				{/* Reserves space under the fixed navbar, plus breathing room before page content. */}
				<div className="h-28 shrink-0 sm:h-32" aria-hidden="true" />

				<main className="space-y-6 px-4 pt-2 pb-8 lg:pr-4">{children}</main>
			</div>
		</div>
	);
}
