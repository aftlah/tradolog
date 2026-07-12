import { useState } from 'react';
import { FeaturePageShell } from '@shared/components/app-shell/FeaturePageShell';
import { cn } from '@shared/utils/cn';
import { LogoutButton } from '@features/auth/components/LogoutButton';
import {
	SETTINGS_PAGE_ROUTE,
	SETTINGS_TAB_OPTIONS,
	type SettingsTab,
} from '../constants/settings.constants';
import type { SettingsPageData } from '../types/settings.types';
import { ProfileSettingsForm } from './ProfileSettingsForm';
import { AccountsSettingsPanel } from './AccountsSettingsPanel';
import { StrategiesSettingsPanel } from './StrategiesSettingsPanel';
import { SymbolsSettingsPanel } from './SymbolsSettingsPanel';

interface SettingsShellProps {
	data: SettingsPageData;
	activeTab: SettingsTab;
	activeAccountId: string | null;
	userName: string;
	userEmail: string;
}

function settingsTabHref(tab: SettingsTab, activeAccountId: string | null): string {
	const url = new URL(SETTINGS_PAGE_ROUTE, 'http://localhost');
	if (tab !== 'profile') {
		url.searchParams.set('tab', tab);
	}
	if (activeAccountId) {
		url.searchParams.set('accountId', activeAccountId);
	}
	return `${url.pathname}${url.search}`;
}

/**
 * Page-level orchestrator for `/app/settings`.
 * Tabs are real links (`?tab=`) so the correct panel is chosen on the server —
 * switching works even if the React island fails to hydrate.
 */
export function SettingsShell({ data, activeTab, activeAccountId, userName, userEmail }: SettingsShellProps) {
	const [accounts, setAccounts] = useState(data.accounts);
	const [strategies, setStrategies] = useState(data.strategies);
	const [symbols, setSymbols] = useState(data.symbols);

	return (
		<FeaturePageShell
			title="Settings"
			activeHref={SETTINGS_PAGE_ROUTE}
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

			<div className="relative z-20 mt-6">
				<div
					role="tablist"
					aria-label="Settings sections"
					className="inline-flex min-h-11 flex-wrap items-center gap-1 rounded-2xl border border-white/10 bg-white/4 p-1"
				>
					{SETTINGS_TAB_OPTIONS.map((tab) => {
						const isActive = activeTab === tab.id;
						return (
							<a
								key={tab.id}
								role="tab"
								id={`settings-tab-${tab.id}`}
								href={settingsTabHref(tab.id, activeAccountId)}
								aria-selected={isActive}
								aria-controls={`settings-panel-${tab.id}`}
								className={cn(
									'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
									isActive ? 'bg-white/10 text-foreground' : 'text-muted hover:text-foreground',
								)}
							>
								{tab.label}
							</a>
						);
					})}
				</div>

				<div className="mt-6">
					{activeTab === 'profile' ? (
						<div role="tabpanel" id="settings-panel-profile" aria-labelledby="settings-tab-profile">
							<ProfileSettingsForm profile={data.profile} />
						</div>
					) : null}

					{activeTab === 'accounts' ? (
						<div role="tabpanel" id="settings-panel-accounts" aria-labelledby="settings-tab-accounts">
							<AccountsSettingsPanel accounts={accounts} onAccountsChange={setAccounts} />
						</div>
					) : null}

					{activeTab === 'strategies' ? (
						<div role="tabpanel" id="settings-panel-strategies" aria-labelledby="settings-tab-strategies">
							<StrategiesSettingsPanel strategies={strategies} onStrategiesChange={setStrategies} />
						</div>
					) : null}

					{activeTab === 'symbols' ? (
						<div role="tabpanel" id="settings-panel-symbols" aria-labelledby="settings-tab-symbols">
							<SymbolsSettingsPanel symbols={symbols} onSymbolsChange={setSymbols} />
						</div>
					) : null}
				</div>
			</div>
		</FeaturePageShell>
	);
}
