import {
	BarChart3,
	CalendarDays,
	LayoutDashboard,
	NotebookPen,
	PanelLeftClose,
	PanelLeftOpen,
	Settings,
	Target,
	TrendingUp,
} from 'lucide-react';
import { cn } from '@shared/utils/cn';
import type { NavItem } from '@shared/types';
import { Button } from '../ui/button';

const ICONS: Record<NavItem['icon'], typeof LayoutDashboard> = {
	dashboard: LayoutDashboard,
	trades: TrendingUp,
	analytics: BarChart3,
	calendar: CalendarDays,
	goals: Target,
	notes: NotebookPen,
	settings: Settings,
};

interface SidebarContentProps {
	navItems: NavItem[];
	activeHref: string;
	collapsed?: boolean;
	onNavigate?: () => void;
	onToggleCollapsed?: () => void;
}

export function SidebarContent({
	navItems,
	activeHref,
	collapsed = false,
	onNavigate,
	onToggleCollapsed,
}: SidebarContentProps) {
	return (
		<div className="flex h-full flex-col">
			{collapsed ? (
				<div className="mb-4 flex flex-col items-center gap-2 pt-1">
					<div className="flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-300/20 to-slate-600/40 text-indigo-300 shadow-[0_0_24px_rgb(129_140_248_/_0.18)] ring-1 ring-indigo-300/25">
						<TrendingUp className="size-5" />
					</div>
					{onToggleCollapsed ? (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="shrink-0 text-muted hover:text-foreground"
							onClick={onToggleCollapsed}
							aria-label="Expand sidebar"
							aria-expanded={false}
						>
							<PanelLeftOpen className="size-4.5" aria-hidden="true" />
						</Button>
					) : null}
				</div>
			) : (
				<div className="flex items-center justify-between gap-2 px-2 pb-6 pt-1">
					<div className="flex min-w-0 items-center gap-2">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-300/20 to-slate-600/40 text-indigo-300 shadow-[0_0_24px_rgb(129_140_248_/_0.18)] ring-1 ring-indigo-300/25">
							<TrendingUp className="size-5" />
						</div>
						<span className="truncate bg-gradient-to-r from-slate-50 to-indigo-200/80 bg-clip-text text-lg font-semibold tracking-tight text-transparent">
							Tradolog
						</span>
					</div>
					{onToggleCollapsed ? (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="shrink-0 text-muted hover:text-foreground"
							onClick={onToggleCollapsed}
							aria-label="Collapse sidebar"
							aria-expanded={true}
						>
							<PanelLeftClose className="size-4.5" aria-hidden="true" />
						</Button>
					) : null}
				</div>
			)}

			<nav aria-label="Primary" className="flex-1 space-y-1">
				{navItems.map((item) => {
					const Icon = ICONS[item.icon];
					const isActive = item.href === activeHref;

					if (!item.enabled) {
						return (
							<div
								key={item.id}
								aria-disabled="true"
								title={collapsed ? `${item.label} (Soon)` : undefined}
								className={cn(
									'flex items-center rounded-xl py-2.5 text-sm text-muted/60',
									collapsed ? 'justify-center px-2' : 'justify-between gap-2 px-3',
								)}
							>
								<span className={cn('flex items-center', collapsed ? '' : 'gap-3')}>
									<Icon className="size-4.5 shrink-0" aria-hidden="true" />
									{!collapsed ? item.label : null}
								</span>
								{!collapsed ? (
									<span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted/70 uppercase">
										Soon
									</span>
								) : null}
							</div>
						);
					}

					return (
						<a
							key={item.id}
							href={item.href}
							onClick={onNavigate}
							aria-current={isActive ? 'page' : undefined}
							title={collapsed ? item.label : undefined}
							className={cn(
								'flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors duration-200',
								collapsed ? 'justify-center px-2' : 'gap-3 px-3',
								isActive
									? 'bg-gradient-to-r from-primary/15 to-slate-500/10 text-indigo-200 shadow-[inset_0_0_0_1px_rgb(165_180_252_/_0.18)]'
									: 'text-muted hover:bg-white/5 hover:text-foreground',
							)}
						>
							<Icon className="size-4.5 shrink-0" aria-hidden="true" />
							{!collapsed ? item.label : <span className="sr-only">{item.label}</span>}
						</a>
					);
				})}
			</nav>

			{!collapsed ? (
				<div className="mt-6 rounded-2xl border border-white/8 bg-white/3 p-4">
					<p className="text-xs font-medium text-muted">Tradolog</p>
					<p className="mt-1 text-xs text-muted/70">Track Every Trade. Master Every Decision.</p>
				</div>
			) : null}
		</div>
	);
}
