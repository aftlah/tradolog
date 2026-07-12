/**
 * Dashboard feature public exports.
 */
export { DashboardShell } from './components/DashboardShell';
export { DashboardService, dashboardService } from './services/dashboard.service';
export type {
	DashboardData,
	DashboardDrawdownSummary,
	DashboardEquityPoint,
	DashboardRecentTrade,
} from './types/dashboard.types';
export { RECENT_TRADES_LIMIT, DASHBOARD_API_ROUTE } from './constants/dashboard.constants';
