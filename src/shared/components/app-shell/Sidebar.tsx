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
			<aside
				aria-label="Sidebar"
				aria-expanded={!collapsed}
				className={cn(
					'glass-panel fixed inset-y-4 left-4 z-40 hidden flex-col p-3 transition-[width] duration-300 ease-out lg:flex',
					collapsed ? 'w-[4.5rem]' : 'w-64 p-4',
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
