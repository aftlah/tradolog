import { useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Star, Trash2, Wallet } from 'lucide-react';
import { Badge, Button, ConfirmDialog } from '@shared/components';
import { formatCurrency } from '@shared/utils/format';
import { ACCOUNT_TYPE_OPTIONS, SETTINGS_ACCOUNTS_API_ROUTE } from '../constants/settings.constants';
import type { AccountSettingsDto } from '../types/settings.types';
import { AccountFormDialog } from './AccountFormDialog';

interface AccountsSettingsPanelProps {
	accounts: AccountSettingsDto[];
	onAccountsChange: (accounts: AccountSettingsDto[]) => void;
}

const ACCOUNT_TYPE_LABEL = new Map(ACCOUNT_TYPE_OPTIONS.map((option) => [option.value, option.label]));

/** Lists trading accounts with create/edit/delete, keeping exactly one account marked default. */
export function AccountsSettingsPanel({ accounts, onAccountsChange }: AccountsSettingsPanelProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingAccount, setEditingAccount] = useState<AccountSettingsDto | null>(null);
	const [deletingAccount, setDeletingAccount] = useState<AccountSettingsDto | null>(null);

	function handleAddClick() {
		setEditingAccount(null);
		setDialogOpen(true);
	}

	function handleEditClick(account: AccountSettingsDto) {
		setEditingAccount(account);
		setDialogOpen(true);
	}

	function handleSaved(saved: AccountSettingsDto) {
		const others = saved.isDefault ? accounts.map((account) => ({ ...account, isDefault: false })) : accounts;
		const exists = others.some((account) => account.id === saved.id);
		onAccountsChange(exists ? others.map((account) => (account.id === saved.id ? saved : account)) : [saved, ...others]);
	}

	async function handleDelete() {
		if (!deletingAccount) {
			return;
		}
		const response = await fetch(`${SETTINGS_ACCOUNTS_API_ROUTE}/${deletingAccount.id}`, { method: 'DELETE' });
		if (!response.ok) {
			toast.error('Could not delete this account. Please try again.');
			return;
		}
		onAccountsChange(accounts.filter((account) => account.id !== deletingAccount.id));
		toast.success('Account deleted.');
	}

	return (
		<div className="glass-card p-6">
			<div className="mb-5 flex items-center justify-between">
				<div>
					<h2 className="text-sm font-medium text-muted">Trading Accounts</h2>
					<p className="mt-1 text-xs text-muted">Manage the accounts you journal trades against.</p>
				</div>
				<Button type="button" size="sm" onClick={handleAddClick} className="gap-1.5">
					<Plus className="size-4" aria-hidden="true" />
					Add Account
				</Button>
			</div>

			{accounts.length === 0 ? (
				<p className="py-10 text-center text-sm text-muted">No accounts yet. Add your first trading account to get started.</p>
			) : (
				<div className="space-y-3">
					{accounts.map((account) => (
						<div
							key={account.id}
							className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div className="flex items-start gap-3">
								<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<Wallet className="size-4.5" aria-hidden="true" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<p className="font-medium text-foreground">{account.name}</p>
										{account.isDefault ? (
											<Badge variant="primary" className="gap-1">
												<Star className="size-3" aria-hidden="true" />
												Default
											</Badge>
										) : null}
										<Badge variant="muted">{ACCOUNT_TYPE_LABEL.get(account.accountType) ?? account.accountType}</Badge>
									</div>
									<p className="mt-1 text-xs text-muted">
										{account.broker ? `${account.broker} · ` : ''}
										{formatCurrency(account.currentBalance, account.currency)} balance
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2 self-end sm:self-auto">
								<Button type="button" variant="outline" size="sm" onClick={() => handleEditClick(account)} className="gap-1.5">
									<Pencil className="size-3.5" aria-hidden="true" />
									Edit
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label="Delete account"
									onClick={() => setDeletingAccount(account)}
								>
									<Trash2 className="size-4" aria-hidden="true" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			<AccountFormDialog open={dialogOpen} onOpenChange={setDialogOpen} account={editingAccount} onSaved={handleSaved} />

			<ConfirmDialog
				open={deletingAccount !== null}
				onOpenChange={(open) => (open ? null : setDeletingAccount(null))}
				title="Delete this account?"
				description="This removes the account from your journal. Trades already logged against it are kept for history."
				onConfirm={handleDelete}
			/>
		</div>
	);
}
