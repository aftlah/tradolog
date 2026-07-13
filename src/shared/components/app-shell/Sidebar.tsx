import { Dialog, DialogContent } from '../ui/dialog';
import type { NavItem } from '@shared/types';
import { cn } from '@shared/utils/cn';
import { VisuallyHiddenTitle } from './VisuallyHiddenTitle';
import { SidebarContent } from './SidebarContent';

interface SidebarProps {
	navItems: NavItem[];
	activeHref: string;
	collapsed: boolean;
	onCollapsedChange: (collapsed: boolean) => void;
	mobileOpen: boolean;
	onMobileOpenChange: (open: boolean) => void;
	animateLayout?: boolean;
}

export function Sidebar({
	navItems,
	activeHref,
	collapsed,
	onCollapsedChange,
	mobileOpen,
	onMobileOpenChange,
	animateLayout = false,
}: SidebarProps) {
	return (
		<>
			<aside
				aria-label="Sidebar"
				aria-expanded={!collapsed}
				data-collapsed={collapsed ? 'true' : undefined}
				className={cn(
					'glass-panel app-shell-sidebar fixed inset-y-3 left-3 z-40 hidden flex-col overflow-hidden py-4 lg:flex',
					animateLayout && 'app-shell-sidebar--animated',
				)}
			>
				<SidebarContent
					navItems={navItems}
					activeHref={activeHref}
					collapsed={collapsed}
					onToggleCollapsed={() => onCollapsedChange(!collapsed)}
				/>
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

export { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from './sidebar.motion';
