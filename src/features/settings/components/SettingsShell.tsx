import { useState } from 'react';
import { cn } from '@shared/utils/cn';
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
import { RiskRulesSettingsForm } from './RiskRulesSettingsForm';
import { SharingSettingsPanel } from '@features/sharing/components/SharingSettingsPanel';

interface SettingsShellProps {
	data: SettingsPageData;
	activeTab: SettingsTab;
	activeAccountId: string | null;
}

function syncSettingsTabUrl(tab: SettingsTab, activeAccountId: string | null): void {
	const url = new URL(SETTINGS_PAGE_ROUTE, window.location.origin);
	if (tab !== 'profile') {
		url.searchParams.set('tab', tab);
	}
	if (activeAccountId) {
		url.searchParams.set('accountId', activeAccountId);
	}
	window.history.replaceState({}, '', `${url.pathname}${url.search}`);
}

/** Settings page body — chrome lives in the persisted `AppLayout` shell. */
export function SettingsShell({ data, activeTab: initialTab, activeAccountId }: SettingsShellProps) {
	const [activeTab, setActiveTab] = useState(initialTab);
	const [accounts, setAccounts] = useState(data.accounts);
	const [strategies, setStrategies] = useState(data.strategies);
	const [symbols, setSymbols] = useState(data.symbols);

	function selectTab(tab: SettingsTab) {
		setActiveTab(tab);
		syncSettingsTabUrl(tab, activeAccountId);
	}

	return (
		<>
			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
				<p className="mt-1 text-sm text-muted">
					Manage your profile, accounts, strategies, symbols, risk rules, and mentor sharing.
				</p>
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
							<button
								key={tab.id}
								type="button"
								role="tab"
								id={`settings-tab-${tab.id}`}
								aria-selected={isActive}
								aria-controls={`settings-panel-${tab.id}`}
								onClick={() => selectTab(tab.id)}
								className={cn(
									'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
									isActive ? 'bg-white/10 text-foreground' : 'text-muted hover:text-foreground',
								)}
							>
								{tab.label}
							</button>
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

					{activeTab === 'risk' ? (
						<div role="tabpanel" id="settings-panel-risk" aria-labelledby="settings-tab-risk">
							<RiskRulesSettingsForm rules={data.riskRules} />
						</div>
					) : null}

					{activeTab === 'sharing' ? (
						<div role="tabpanel" id="settings-panel-sharing" aria-labelledby="settings-tab-sharing">
							<SharingSettingsPanel initialOutgoing={data.outgoingShares} />
						</div>
					) : null}
				</div>
			</div>
		</>
	);
}
