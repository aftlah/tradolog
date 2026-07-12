/**
 * Settings feature public exports.
 */
export { SettingsShell } from './components/SettingsShell';

export { settingsService, SettingsService } from './services/settings.service';

export type {
	AccountSettingsDto,
	ProfileSettingsDto,
	SettingsPageData,
	StrategySettingsDto,
	SymbolSettingsDto,
} from './types/settings.types';

export {
	SETTINGS_ACCOUNTS_API_ROUTE,
	SETTINGS_PAGE_ROUTE,
	SETTINGS_PROFILE_API_ROUTE,
	SETTINGS_STRATEGIES_API_ROUTE,
	SETTINGS_SYMBOLS_API_ROUTE,
	SETTINGS_TAB_OPTIONS,
	SETTINGS_TABS,
	parseSettingsTab,
} from './constants/settings.constants';

export type { SettingsTab } from './constants/settings.constants';
