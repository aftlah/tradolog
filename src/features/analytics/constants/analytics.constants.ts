export const ANALYTICS_API_ROUTE = '/api/analytics/data';

/** Match dashboard — only recent equity/drawdown points ship in SSR HTML. */
export const EQUITY_CURVE_LOOKBACK_DAYS = 90;
export const DRAWDOWN_CHART_LOOKBACK_DAYS = 90;

/** Number of most-recent daily-return buckets rendered in the period-returns chart. */
export const DAILY_RETURNS_LOOKBACK = 30;

/** Number of most-recent weekly-return buckets rendered in the period-returns chart. */
export const WEEKLY_RETURNS_LOOKBACK = 12;

/** Number of most-recent monthly-return buckets rendered in the period-returns chart. */
export const MONTHLY_RETURNS_LOOKBACK = 12;
