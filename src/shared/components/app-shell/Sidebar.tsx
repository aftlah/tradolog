import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '../ui/dialog';
import type { NavItem } from '@shared/types';
import { VisuallyHiddenTitle } from './VisuallyHiddenTitle';
import { SidebarContent } from './SidebarContent';
import {
	SIDEBAR_COLLAPSED_WIDTH,
	SIDEBAR_EXPANDED_WIDTH,
	sidebarTransition,
} from './sidebar.motion';

interface SidebarProps {
	navItems: NavItem[];
	activeHref: string;
	collapsed: boolean;
	onCollapsedChange: (collapsed: boolean) => void;
	mobileOpen: boolean;
	onMobileOpenChange: (open: boolean) => void;
}

export function Sidebar({
	navItems,
	activeHref,
	collapsed,
	onCollapsedChange,
	mobileOpen,
	onMobileOpenChange,
}: SidebarProps) {
	return (
		<>
			<motion.aside
				aria-label="Sidebar"
				aria-expanded={!collapsed}
				initial={false}
				animate={{
					width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
					paddingLeft: collapsed ? 12 : 16,
					paddingRight: collapsed ? 12 : 16,
				}}
				transition={sidebarTransition}
				className="glass-panel fixed inset-y-4 left-4 z-40 hidden flex-col overflow-hidden py-4 lg:flex"
			>
				<SidebarContent
					navItems={navItems}
					activeHref={activeHref}
					collapsed={collapsed}
					onToggleCollapsed={() => onCollapsedChange(!collapsed)}
				/>
			</motion.aside>

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

export { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH, sidebarTransition } from './sidebar.motion';
