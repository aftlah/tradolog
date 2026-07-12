import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '@shared/constants/nav.constants';
import type { AccountOption } from '@shared/types';
import { Sidebar } from './Sidebar';
import {
	SIDEBAR_COLLAPSED_WIDTH,
	SIDEBAR_EXPANDED_WIDTH,
	sidebarTransition,
} from './sidebar.motion';
import { Navbar } from './Navbar';

const SIDEBAR_COLLAPSED_KEY = 'tradolog.sidebar.collapsed';
const SIDEBAR_INSET = 16;
const SIDEBAR_GAP = 16;

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

function useIsLargeScreen(): boolean {
	const [isLarge, setIsLarge] = useState(false);

	useEffect(() => {
		const media = window.matchMedia('(min-width: 1024px)');
		const sync = () => setIsLarge(media.matches);
		sync();
		media.addEventListener('change', sync);
		return () => media.removeEventListener('change', sync);
	}, []);

	return isLarge;
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
	const isLargeScreen = useIsLargeScreen();

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

	const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
	const contentOffset = isLargeScreen ? SIDEBAR_INSET + sidebarWidth + SIDEBAR_GAP : 0;

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

			<motion.div
				className="relative z-10"
				initial={false}
				animate={{ paddingLeft: contentOffset }}
				transition={sidebarTransition}
			>
				<motion.div
					className="pointer-events-none fixed inset-x-0 top-0 z-30 px-4 pt-4 lg:pr-4"
					initial={false}
					animate={{ left: contentOffset }}
					transition={sidebarTransition}
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
				</motion.div>

				<div className="h-32 shrink-0 sm:h-36" aria-hidden="true" />

				<main className="space-y-6 px-4 pt-2 pb-8 lg:pr-4">{children}</main>
			</motion.div>
		</div>
	);
}
