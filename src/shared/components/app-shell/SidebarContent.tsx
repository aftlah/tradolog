import {
	BarChart3,
	CalendarDays,
	LayoutDashboard,
	NotebookPen,
	Settings,
	Target,
	TrendingUp,
} from 'lucide-react';
import { cn } from '@shared/utils/cn';
import type { NavItem } from '@shared/types';

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
	onNavigate?: () => void;
}

/**
 * Shared nav list rendered both by the fixed desktop sidebar and the mobile slide-over, so the
 * two never drift out of sync.
 */
export function SidebarContent({ navItems, activeHref, onNavigate }: SidebarContentProps) {
	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center gap-2 px-2 pb-6 pt-1">
				<div className="flex size-9 items-center justify-center rounded-2xl bg-primary/15 text-primary">
					<TrendingUp className="size-5" />
				</div>
				<span className="text-lg font-semibold tracking-tight text-foreground">Tradolog</span>
			</div>

			<nav aria-label="Primary" className="flex-1 space-y-1">
				{navItems.map((item) => {
					const Icon = ICONS[item.icon];
					const isActive = item.href === activeHref;

					if (!item.enabled) {
						return (
							<div
								key={item.id}
								aria-disabled="true"
								className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-muted/60"
							>
								<span className="flex items-center gap-3">
									<Icon className="size-4.5" aria-hidden="true" />
									{item.label}
								</span>
								<span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted/70 uppercase">
									Soon
								</span>
							</div>
						);
					}

					return (
						<a
							key={item.id}
							href={item.href}
							onClick={onNavigate}
							aria-current={isActive ? 'page' : undefined}
							className={cn(
								'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
								isActive
									? 'bg-primary/15 text-primary'
									: 'text-muted hover:bg-white/5 hover:text-foreground',
							)}
						>
							<Icon className="size-4.5" aria-hidden="true" />
							{item.label}
						</a>
					);
				})}
			</nav>

			<div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
				<p className="text-xs font-medium text-muted">Tradolog</p>
				<p className="mt-1 text-xs text-muted/70">Track Every Trade. Master Every Decision.</p>
			</div>
		</div>
	);
}
