import { Menu } from 'lucide-react';
import { LogoutButton } from '@features/auth';
import {
	Avatar,
	AvatarFallback,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@shared/components';
import { AccountSwitcher } from './AccountSwitcher';
import { QuickAddTradeButton } from './QuickAddTradeButton';
import type { DashboardAccountOption } from '../types/dashboard.types';

interface NavbarProps {
	title: string;
	userName: string;
	userEmail: string;
	accounts: DashboardAccountOption[];
	activeAccountId: string | null;
	onAccountChange: (accountId: string) => void;
	onOpenMobileNav: () => void;
	isLoadingAccount?: boolean;
}

function initialsFor(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) {
		return 'T';
	}
	const first = parts[0]?.[0] ?? '';
	const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
	return `${first}${last}`.toUpperCase();
}

/** Floating Navbar: sticky glass panel with the mobile nav trigger, account switcher, quick add, and user menu. */
export function Navbar({
	title,
	userName,
	userEmail,
	accounts,
	activeAccountId,
	onAccountChange,
	onOpenMobileNav,
	isLoadingAccount,
}: NavbarProps) {
	return (
		<header className="glass-panel sticky top-4 z-30 flex items-center justify-between gap-3 px-4 py-3">
			<div className="flex items-center gap-3">
				<Button
					variant="ghost"
					size="icon"
					className="lg:hidden"
					onClick={onOpenMobileNav}
					aria-label="Open navigation"
				>
					<Menu className="size-5" aria-hidden="true" />
				</Button>
				<div>
					<p className="text-sm font-medium text-muted">Welcome back</p>
					<h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
				</div>
			</div>

			<div className="flex items-center gap-2">
				{accounts.length > 0 ? (
					<AccountSwitcher
						accounts={accounts}
						activeAccountId={activeAccountId}
						onChange={onAccountChange}
						disabled={isLoadingAccount}
					/>
				) : null}
				<QuickAddTradeButton />

				<DropdownMenu>
					<DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
						<Avatar>
							<AvatarFallback>{initialsFor(userName)}</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuLabel className="truncate">{userName}</DropdownMenuLabel>
						{userEmail ? <p className="truncate px-2.5 pb-2 text-xs text-muted">{userEmail}</p> : null}
						<DropdownMenuSeparator />
						<div className="p-1">
							<LogoutButton className="w-full" />
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
