import { AnimatePresence, motion } from 'framer-motion';
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
import { sidebarLabelTransition, sidebarTransition } from './sidebar.motion';

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
			<div
				className={cn(
					'mb-5 flex items-center pt-1',
					collapsed ? 'flex-col gap-2' : 'justify-between gap-2 px-1',
				)}
			>
				<div className={cn('flex min-w-0 items-center', collapsed ? 'justify-center' : 'gap-2')}>
					<div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-300/20 to-slate-600/40 text-indigo-300 shadow-[0_0_24px_rgb(129_140_248_/_0.18)] ring-1 ring-indigo-300/25">
						<TrendingUp className="size-5" />
					</div>
					<AnimatePresence initial={false} mode="popLayout">
						{!collapsed ? (
							<motion.span
								key="brand"
								initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
								animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
								exit={{
									opacity: 0,
									x: -6,
									filter: 'blur(4px)',
									transition: { duration: 0.14, ease: 'easeOut' },
								}}
								transition={{ ...sidebarLabelTransition, delay: 0.06 }}
								className="overflow-hidden whitespace-nowrap bg-gradient-to-r from-slate-50 to-indigo-200/80 bg-clip-text text-lg font-semibold tracking-tight text-transparent"
							>
								Tradolog
							</motion.span>
						) : null}
					</AnimatePresence>
				</div>

				{onToggleCollapsed ? (
					<motion.div layout transition={sidebarTransition}>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="shrink-0 text-muted hover:text-foreground"
							onClick={onToggleCollapsed}
							aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
							aria-expanded={!collapsed}
						>
							{collapsed ? (
								<PanelLeftOpen className="size-4.5" aria-hidden="true" />
							) : (
								<PanelLeftClose className="size-4.5" aria-hidden="true" />
							)}
						</Button>
					</motion.div>
				) : null}
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
								title={collapsed ? `${item.label} (Soon)` : undefined}
								className={cn(
									'flex items-center rounded-xl py-2.5 text-sm text-muted/60',
									collapsed ? 'justify-center px-2' : 'justify-between gap-2 px-3',
								)}
							>
								<span className={cn('flex min-w-0 items-center', !collapsed && 'gap-3')}>
									<Icon className="size-4.5 shrink-0" aria-hidden="true" />
									<AnimatePresence initial={false}>
										{!collapsed ? (
											<motion.span
												key={`${item.id}-label`}
												initial={{ opacity: 0, x: -8 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{
													opacity: 0,
													x: -4,
													transition: { duration: 0.12, ease: 'easeOut' },
												}}
												transition={{ ...sidebarLabelTransition, delay: 0.05 }}
												className="truncate"
											>
												{item.label}
											</motion.span>
										) : null}
									</AnimatePresence>
								</span>
								<AnimatePresence initial={false}>
									{!collapsed ? (
										<motion.span
											key={`${item.id}-soon`}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0, transition: { duration: 0.1 } }}
											transition={{ ...sidebarLabelTransition, delay: 0.08 }}
											className="rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted/70 uppercase"
										>
											Soon
										</motion.span>
									) : null}
								</AnimatePresence>
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
								'flex items-center rounded-xl py-2.5 text-sm font-medium transition-[background-color,color] duration-200',
								collapsed ? 'justify-center px-2' : 'gap-3 px-3',
								isActive
									? 'bg-gradient-to-r from-primary/15 to-slate-500/10 text-indigo-200 shadow-[inset_0_0_0_1px_rgb(165_180_252_/_0.18)]'
									: 'text-muted hover:bg-white/5 hover:text-foreground',
							)}
						>
							<Icon className="size-4.5 shrink-0" aria-hidden="true" />
							<AnimatePresence initial={false}>
								{!collapsed ? (
									<motion.span
										key={`${item.id}-label`}
										initial={{ opacity: 0, x: -8 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{
											opacity: 0,
											x: -4,
											transition: { duration: 0.12, ease: 'easeOut' },
										}}
										transition={{ ...sidebarLabelTransition, delay: 0.05 }}
										className="truncate"
									>
										{item.label}
									</motion.span>
								) : (
									<span className="sr-only">{item.label}</span>
								)}
							</AnimatePresence>
						</a>
					);
				})}
			</nav>

			<AnimatePresence initial={false}>
				{!collapsed ? (
					<motion.div
						key="sidebar-footer"
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{
							opacity: 0,
							y: 4,
							transition: { duration: 0.12, ease: 'easeOut' },
						}}
						transition={{ ...sidebarLabelTransition, delay: 0.08 }}
						className="mt-6 overflow-hidden"
					>
						<div className="rounded-2xl border border-white/8 bg-white/3 p-4">
							<p className="text-xs font-medium text-muted">Tradolog</p>
							<p className="mt-1 text-xs text-muted/70">Track Every Trade. Master Every Decision.</p>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
