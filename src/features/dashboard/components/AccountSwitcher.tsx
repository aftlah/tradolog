import { Check, ChevronsUpDown, Wallet } from 'lucide-react';
import {
	Badge,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@shared/components';
import { formatCurrency } from '@shared/utils/format';
import type { DashboardAccountOption } from '../types/dashboard.types';

interface AccountSwitcherProps {
	accounts: DashboardAccountOption[];
	activeAccountId: string | null;
	onChange: (accountId: string) => void;
	disabled?: boolean;
}

const ACCOUNT_TYPE_LABEL: Record<DashboardAccountOption['accountType'], string> = {
	live: 'Live',
	demo: 'Demo',
	paper: 'Paper',
};

export function AccountSwitcher({ accounts, activeAccountId, onChange, disabled }: AccountSwitcherProps) {
	const activeAccount = accounts.find((account) => account.id === activeAccountId) ?? accounts[0];

	if (!activeAccount) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				disabled={disabled}
				className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/10 disabled:opacity-60"
			>
				<Wallet className="size-4 text-primary" aria-hidden="true" />
				<span className="max-w-[8rem] truncate">{activeAccount.name}</span>
				<Badge variant="muted" className="hidden sm:inline-flex">
					{ACCOUNT_TYPE_LABEL[activeAccount.accountType]}
				</Badge>
				<ChevronsUpDown className="size-3.5 text-muted" aria-hidden="true" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-72">
				<DropdownMenuLabel>Trading accounts</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{accounts.map((account) => (
					<DropdownMenuItem key={account.id} onSelect={() => onChange(account.id)} className="flex-col items-start gap-0.5">
						<span className="flex w-full items-center justify-between gap-2">
							<span className="flex items-center gap-2 font-medium">
								{account.name}
								{account.isDefault ? (
									<Badge variant="primary" className="text-[10px]">
										Default
									</Badge>
								) : null}
							</span>
							{account.id === activeAccount.id ? <Check className="size-4 text-primary" /> : null}
						</span>
						<span className="text-xs text-muted">
							{ACCOUNT_TYPE_LABEL[account.accountType]} · {formatCurrency(account.currentBalance, account.currency)}
						</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
