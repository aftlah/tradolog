import type { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { AccountOption } from '@shared/types';
import { AccountSwitcher } from './AccountSwitcher';
import { QuickAddTradeButton } from './QuickAddTradeButton';

interface NavbarProps {
	title: string;
	userName: string;
	userEmail: string;
	accounts: AccountOption[];
	activeAccountId: string | null;
	onAccountChange: (accountId: string) => void;
	onOpenMobileNav: () => void;
	isLoadingAccount?: boolean;
	showQuickAdd?: boolean;
	/** Feature-owned logout control, injected by the caller so shared UI never depends on the auth feature. */
	userMenuFooter: ReactNode;
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

/** Floating Navbar: fixed glass panel with the mobile nav trigger, account switcher, quick add, and user menu. */
export function Navbar({
	title,
	userName,
	userEmail,
	accounts,
	activeAccountId,
	onAccountChange,
	onOpenMobileNav,
	isLoadingAccount,
	showQuickAdd = true,
	userMenuFooter,
}: NavbarProps) {
	return (
		<header className="glass-panel flex items-center justify-between gap-3 px-4 py-3 backdrop-blur-2xl">
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
					<p className="text-sm font-medium text-muted">Welcome back {userName}</p>
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
				{showQuickAdd ? <QuickAddTradeButton /> : null}

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
						<div className="p-1">{userMenuFooter}</div>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
