CREATE INDEX IF NOT EXISTS "trades_account_closed_metrics_idx" ON "trades" USING btree ("user_id","account_id","status","deleted_at","closed_at");
