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

function firstNameFor(name: string): string {
	const first = name.trim().split(/\s+/).filter(Boolean)[0];
	return first || 'Trader';
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
	const firstName = firstNameFor(userName);

	return (
		<header className="glass-panel flex items-center justify-between gap-4 px-5 py-3.5 backdrop-blur-2xl">
			<div className="flex min-w-0 items-center gap-3">
				<Button
					variant="ghost"
					size="icon"
					className="lg:hidden"
					onClick={onOpenMobileNav}
					aria-label="Open navigation"
				>
					<Menu className="size-5" aria-hidden="true" />
				</Button>

				<div className="flex min-w-0 items-center gap-3">
					<span
						aria-hidden="true"
						className="hidden h-10 w-1 shrink-0 rounded-full bg-gradient-to-b from-primary to-primary/30 sm:block"
					/>
					<div className="min-w-0">
						<p className="truncate text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
							Welcome back,{' '}
							<span className="text-primary/90 normal-case tracking-normal">{firstName}</span>
						</p>
						<h1 className="mt-0.5 truncate text-xl font-semibold tracking-tight text-foreground sm:text-[1.35rem]">
							{title}
						</h1>
					</div>
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
