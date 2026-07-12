/**
 * Rounding precision for currency-denominated values (entry/exit prices, P&L, risk/reward
 * amounts). Matches the `numeric(18, 8)` scale used for price/amount columns in the trades
 * schema, so calculator output round-trips cleanly with the database.
 */
export const PRICE_DECIMALS = 8;

/** Matches the `numeric(12, 4)` scale used for `planned_rr` / `actual_rr` columns. */
export const RR_DECIMALS = 4;

/** Matches the `numeric(12, 6)` scale used for `profit_loss_percent` and period returns. */
export const PERCENT_DECIMALS = 6;

/** Matches the `numeric(12, 4)` scale used for the `pips` column. */
export const PIPS_DECIMALS = 4;

export const MS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;

export const SECONDS_PER_MINUTE_TOTAL = SECONDS_PER_MINUTE;
export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
export const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY;
