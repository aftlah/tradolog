import { useState, type ReactNode } from 'react';
import { cn } from '@shared/utils/cn';
import { NAV_ITEMS } from '@shared/constants/nav.constants';
import type { AccountOption } from '@shared/types';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import {
	persistSidebarCollapsedPreference,
	readSidebarCollapsedPreference,
	syncSidebarCollapsedDocument,
} from './sidebar.motion';

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
	userMenuFooter: ReactNode;
	children: ReactNode;
}

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
	const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
		const collapsed = readSidebarCollapsedPreference();
		syncSidebarCollapsedDocument(collapsed);
		return collapsed;
	});
	const [animateLayout, setAnimateLayout] = useState(false);

	function handleCollapsedChange(collapsed: boolean) {
		setAnimateLayout(true);
		setSidebarCollapsed(collapsed);
		persistSidebarCollapsedPreference(collapsed);
	}

	return (
		<div className="relative min-h-dvh">
			<div
				aria-hidden="true"
				className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(99_102_241_/_0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgb(148_163_184_/_0.05),_transparent_45%)]"
			/>

			<Sidebar
				navItems={NAV_ITEMS}
				activeHref={activeHref}
				collapsed={sidebarCollapsed}
				onCollapsedChange={handleCollapsedChange}
				mobileOpen={mobileNavOpen}
				onMobileOpenChange={setMobileNavOpen}
				animateLayout={animateLayout}
			/>

			<div
				className={cn('relative z-10 app-shell-offset', animateLayout && 'app-shell-offset--animated')}
				data-collapsed={sidebarCollapsed ? 'true' : undefined}
			>
				<div className="app-shell-navbar pointer-events-none fixed top-0 right-0 z-30 px-4 pt-4 lg:pr-4">
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

				<div className="h-32 shrink-0 sm:h-36" aria-hidden="true" />

				<main className="space-y-6 px-4 pt-2 pb-8 lg:pr-4">{children}</main>
			</div>
		</div>
	);
}
