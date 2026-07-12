import { useState } from 'react';
import { FeaturePageShell, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components';
import { LogoutButton } from '@features/auth';
import type { SettingsPageData } from '../types/settings.types';
import { ProfileSettingsForm } from './ProfileSettingsForm';
import { AccountsSettingsPanel } from './AccountsSettingsPanel';
import { StrategiesSettingsPanel } from './StrategiesSettingsPanel';
import { SymbolsSettingsPanel } from './SymbolsSettingsPanel';

interface SettingsShellProps {
	data: SettingsPageData;
	activeAccountId: string | null;
	userName: string;
	userEmail: string;
}

/** Page-level orchestrator for `/app/settings` — Profile, Accounts, Strategies, Symbols tabs. */
export function SettingsShell({ data, activeAccountId, userName, userEmail }: SettingsShellProps) {
	const [accounts, setAccounts] = useState(data.accounts);
	const [strategies, setStrategies] = useState(data.strategies);
	const [symbols, setSymbols] = useState(data.symbols);

	return (
		<FeaturePageShell
			title="Settings"
			activeHref="/app/settings"
			accounts={accounts}
			activeAccountId={activeAccountId}
			userName={userName}
			userEmail={userEmail}
			userMenuFooter={<LogoutButton className="w-full" />}
			showQuickAdd={accounts.length > 0}
		>
			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
				<p className="mt-1 text-sm text-muted">Manage your profile, trading accounts, strategies, and symbols.</p>
			</div>

			<Tabs defaultValue="profile" className="mt-6">
				<TabsList>
					<TabsTrigger value="profile">Profile</TabsTrigger>
					<TabsTrigger value="accounts">Accounts</TabsTrigger>
					<TabsTrigger value="strategies">Strategies</TabsTrigger>
					<TabsTrigger value="symbols">Symbols</TabsTrigger>
				</TabsList>

				<TabsContent value="profile">
					<ProfileSettingsForm profile={data.profile} />
				</TabsContent>

				<TabsContent value="accounts">
					<AccountsSettingsPanel accounts={accounts} onAccountsChange={setAccounts} />
				</TabsContent>

				<TabsContent value="strategies">
					<StrategiesSettingsPanel strategies={strategies} onStrategiesChange={setStrategies} />
				</TabsContent>

				<TabsContent value="symbols">
					<SymbolsSettingsPanel symbols={symbols} onSymbolsChange={setSymbols} />
				</TabsContent>
			</Tabs>
		</FeaturePageShell>
	);
}
