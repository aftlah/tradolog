import { Dialog, DialogContent } from '../ui/dialog';
import type { NavItem } from '@shared/types';
import { VisuallyHiddenTitle } from './VisuallyHiddenTitle';
import { SidebarContent } from './SidebarContent';

interface SidebarProps {
	navItems: NavItem[];
	activeHref: string;
	mobileOpen: boolean;
	onMobileOpenChange: (open: boolean) => void;
}

/**
 * Floating Sidebar: a fixed, glass-panel rail on desktop (lg+), and a slide-over `Dialog` on
 * smaller screens so the same nav content works everywhere without duplicating markup.
 */
export function Sidebar({ navItems, activeHref, mobileOpen, onMobileOpenChange }: SidebarProps) {
	return (
		<>
			<aside
				aria-label="Sidebar"
				className="glass-panel fixed inset-y-4 left-4 z-40 hidden w-64 flex-col p-4 lg:flex"
			>
				<SidebarContent navItems={navItems} activeHref={activeHref} />
			</aside>

			<Dialog open={mobileOpen} onOpenChange={onMobileOpenChange}>
				<DialogContent
					showClose
					className="left-4 top-4 h-[calc(100dvh-2rem)] max-h-none w-64 max-w-none translate-x-0 translate-y-0 p-4 lg:hidden"
				>
					<VisuallyHiddenTitle>Navigation</VisuallyHiddenTitle>
					<SidebarContent navItems={navItems} activeHref={activeHref} onNavigate={() => onMobileOpenChange(false)} />
				</DialogContent>
			</Dialog>
		</>
	);
}
