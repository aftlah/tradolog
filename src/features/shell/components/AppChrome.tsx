import { useEffect, useState } from 'react';
import { cn } from '@shared/utils/cn';
import { softNavigate } from '@shared/utils/soft-navigate';
import { NAV_ITEMS } from '@shared/constants/nav.constants';
import { Sidebar } from '@shared/components/app-shell/Sidebar';
import { Navbar } from '@shared/components/app-shell/Navbar';
import {
	persistSidebarCollapsedPreference,
	readSidebarCollapsedPreference,
	syncSidebarCollapsedDocument,
} from '@shared/components/app-shell/sidebar.motion';
import { LogoutButton } from '@features/auth/components/LogoutButton';
import { APP_CHROME_STATE_ID, parseAppChromeState, type AppChromeState } from '../types/chrome.types';
import { resolveActiveHref } from '../utils/resolve-active-href';

interface AppChromeProps {
	initialState: AppChromeState;
}

function readStateFromDom(fallback: AppChromeState): AppChromeState {
	const el = document.getElementById(APP_CHROME_STATE_ID);
	return parseAppChromeState(el?.textContent) ?? fallback;
}

/**
 * Persisted across ClientRouter navigations. Reads fresh title/accounts from the page's
 * JSON state script on every `astro:page-load` so the shell never remounts.
 */
export function AppChrome({ initialState }: AppChromeProps) {
	const [state, setState] = useState(initialState);
	const [activeHref, setActiveHref] = useState(() =>
		typeof window === 'undefined' ? '/app' : resolveActiveHref(window.location.pathname),
	);
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
		const collapsed = readSidebarCollapsedPreference();
		syncSidebarCollapsedDocument(collapsed);
		return collapsed;
	});
	const [animateLayout, setAnimateLayout] = useState(false);
	const [isNavigatingAccount, setIsNavigatingAccount] = useState(false);

	useEffect(() => {
		function syncFromPage() {
			setState((prev) => readStateFromDom(prev));
			setActiveHref(resolveActiveHref(window.location.pathname));
			setMobileNavOpen(false);
			setIsNavigatingAccount(false);
		}

		document.addEventListener('astro:page-load', syncFromPage);
		return () => document.removeEventListener('astro:page-load', syncFromPage);
	}, []);

	function handleCollapsedChange(collapsed: boolean) {
		setAnimateLayout(true);
		document.querySelector('.app-shell-offset')?.classList.add('app-shell-offset--animated');
		setSidebarCollapsed(collapsed);
		persistSidebarCollapsedPreference(collapsed);
	}

	async function handleAccountChange(accountId: string) {
		setIsNavigatingAccount(true);
		try {
			if (state.accountChangePath) {
				const url = new URL(state.accountChangePath, window.location.origin);
				url.searchParams.set('accountId', accountId);
				await softNavigate(`${url.pathname}${url.search}`);
				return;
			}

			const url = new URL(window.location.href);
			url.searchParams.set('accountId', accountId);
			await softNavigate(`${url.pathname}${url.search}`);
		} catch {
			setIsNavigatingAccount(false);
		}
	}

	return (
		<>
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
				className={cn(
					'app-shell-navbar pointer-events-none fixed top-0 right-0 z-30 px-4 pt-4 lg:px-4',
					animateLayout && 'app-shell-navbar--animated',
				)}
			>
				<div className="pointer-events-auto">
					<Navbar
						title={state.title}
						userName={state.userName}
						userEmail={state.userEmail}
						accounts={state.accounts}
						activeAccountId={state.activeAccountId}
						onAccountChange={handleAccountChange}
						onOpenMobileNav={() => setMobileNavOpen(true)}
						isLoadingAccount={isNavigatingAccount}
						showQuickAdd={state.showQuickAdd ?? true}
						userMenuFooter={<LogoutButton className="w-full" />}
					/>
				</div>
			</div>
		</>
	);
}
