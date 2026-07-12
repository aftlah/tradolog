/**
 * Dashboard feature public exports.
 */
export { DashboardShell } from './components/DashboardShell';
export { DashboardService, dashboardService } from './services/dashboard.service';
export type {
	DashboardAccountOption,
	DashboardData,
	DashboardDrawdownSummary,
	DashboardEquityPoint,
	DashboardRecentTrade,
	NavItem,
} from './types/dashboard.types';
export { NAV_ITEMS, RECENT_TRADES_LIMIT, DASHBOARD_API_ROUTE } from './constants/dashboard.constants';
