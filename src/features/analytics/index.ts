/**
 * Analytics feature public exports.
 */
export { AnalyticsShell } from './components/AnalyticsShell';
export { AnalyticsService, analyticsService } from './services/analytics.service';
export type {
	AnalyticsData,
	AnalyticsDrawdownPoint,
	AnalyticsDrawdownSummary,
	AnalyticsEquityPoint,
	AnalyticsPeriodGranularity,
	AnalyticsPeriodReturn,
	AnalyticsPeriodReturns,
} from './types/analytics.types';
export {
	ANALYTICS_API_ROUTE,
	DAILY_RETURNS_LOOKBACK,
	MONTHLY_RETURNS_LOOKBACK,
	WEEKLY_RETURNS_LOOKBACK,
} from './constants/analytics.constants';
