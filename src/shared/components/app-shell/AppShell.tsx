import { useEffect, useState, type ReactNode } from 'react';
import { NAV_ITEMS } from '@shared/constants/nav.constants';
import type { AccountOption } from '@shared/types';
import { cn } from '@shared/utils/cn';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const SIDEBAR_COLLAPSED_KEY = 'tradolog.sidebar.collapsed';

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

function readCollapsedPreference(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}
	try {
		return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
	} catch {
		return false;
	}
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
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	useEffect(() => {
		setSidebarCollapsed(readCollapsedPreference());
	}, []);

	function handleCollapsedChange(collapsed: boolean) {
		setSidebarCollapsed(collapsed);
		try {
			window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
		} catch {
			// Ignore storage failures (private mode, quota, etc).
		}
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
			/>

			<div
				className={cn(
					'relative z-10 transition-[padding] duration-300 ease-out',
					sidebarCollapsed ? 'lg:pl-[6.5rem]' : 'lg:pl-[18rem]',
				)}
			>
				<div
					className={cn(
						'pointer-events-none fixed inset-x-0 top-0 z-30 px-4 pt-4 transition-[left] duration-300 ease-out lg:pr-4',
						sidebarCollapsed ? 'lg:left-[6.5rem]' : 'lg:left-[18rem]',
					)}
				>
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
