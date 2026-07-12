-- Domain schema (Feature 2)
-- Trading journal tables; preserves Better Auth tables from 0000_auth_tables.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "public"."account_type" AS ENUM('live', 'demo', 'paper');
CREATE TYPE "public"."market_type" AS ENUM('forex', 'crypto', 'stocks', 'futures', 'indices', 'options', 'other');
CREATE TYPE "public"."trade_side" AS ENUM('long', 'short');
CREATE TYPE "public"."trade_status" AS ENUM('planned', 'open', 'closed', 'cancelled');
CREATE TYPE "public"."trade_result" AS ENUM('win', 'loss', 'breakeven');
CREATE TYPE "public"."review_grade" AS ENUM('A', 'B', 'C', 'D', 'F');
CREATE TYPE "public"."goal_status" AS ENUM('active', 'completed', 'missed', 'cancelled');

CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" text NOT NULL,
	"display_name" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"base_currency" text DEFAULT 'USD' NOT NULL,
	"risk_per_trade_percent" numeric(8, 4),
	"default_risk_reward" numeric(8, 4),
	"bio" text,
	"avatar_url" text,
	"onboarding_completed" boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"broker" text,
	"account_type" "account_type" DEFAULT 'demo' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"starting_balance" numeric(18, 8) DEFAULT '0' NOT NULL,
	"current_balance" numeric(18, 8) DEFAULT '0' NOT NULL,
	"leverage" integer,
	"is_default" boolean DEFAULT false NOT NULL,
	"notes" text
);

CREATE TABLE IF NOT EXISTS "symbols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" text,
	"ticker" text NOT NULL,
	"name" text NOT NULL,
	"market_type" "market_type" DEFAULT 'forex' NOT NULL,
	"base_asset" text,
	"quote_asset" text,
	"exchange" text,
	"pip_size" numeric(18, 10),
	"contract_size" numeric(18, 8),
	"price_precision" integer DEFAULT 5 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"rules" text,
	"color" text,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" text NOT NULL,
	"account_id" uuid NOT NULL,
	"symbol_id" uuid NOT NULL,
	"strategy_id" uuid,
	"side" "trade_side" NOT NULL,
	"status" "trade_status" DEFAULT 'planned' NOT NULL,
	"result" "trade_result",
	"entry_price" numeric(18, 8),
	"exit_price" numeric(18, 8),
	"stop_loss" numeric(18, 8),
	"take_profit" numeric(18, 8),
	"quantity" numeric(18, 8),
	"risk_amount" numeric(18, 8),
	"reward_amount" numeric(18, 8),
	"planned_rr" numeric(12, 4),
	"actual_rr" numeric(12, 4),
	"profit_loss" numeric(18, 8),
	"profit_loss_percent" numeric(12, 6),
	"pips" numeric(12, 4),
	"fees" numeric(18, 8) DEFAULT '0',
	"opened_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"holding_time_seconds" numeric(18, 0),
	"setup" text,
	"mistakes" text,
	"lessons" text,
	"tags" text
);

CREATE TABLE IF NOT EXISTS "trade_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"trade_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"storage_key" text NOT NULL,
	"caption" text,
	"mime_type" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS "trade_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"trade_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS "trade_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"trade_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"grade" "review_grade",
	"followed_plan" boolean,
	"emotional_state" text,
	"execution_quality" integer,
	"summary" text,
	"improvements" text
);

CREATE TABLE IF NOT EXISTS "monthly_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" text NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_profit" numeric(18, 8),
	"target_win_rate" numeric(8, 4),
	"target_trade_count" integer,
	"max_drawdown_percent" numeric(8, 4),
	"status" "goal_status" DEFAULT 'active' NOT NULL
);

CREATE TABLE IF NOT EXISTS "watchlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" text NOT NULL,
	"symbol_id" uuid NOT NULL,
	"list_name" text DEFAULT 'Default' NOT NULL,
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"alert_price" numeric(18, 8)
);

ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "symbols" ADD CONSTRAINT "symbols_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "trades" ADD CONSTRAINT "trades_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "trades" ADD CONSTRAINT "trades_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "trades" ADD CONSTRAINT "trades_symbol_id_symbols_id_fk" FOREIGN KEY ("symbol_id") REFERENCES "public"."symbols"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "trades" ADD CONSTRAINT "trades_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "trade_images" ADD CONSTRAINT "trade_images_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "trade_images" ADD CONSTRAINT "trade_images_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "trade_notes" ADD CONSTRAINT "trade_notes_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "trade_notes" ADD CONSTRAINT "trade_notes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "trade_reviews" ADD CONSTRAINT "trade_reviews_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "trade_reviews" ADD CONSTRAINT "trade_reviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "monthly_goals" ADD CONSTRAINT "monthly_goals_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_symbol_id_symbols_id_fk" FOREIGN KEY ("symbol_id") REFERENCES "public"."symbols"("id") ON DELETE restrict ON UPDATE no action;

CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_uidx" ON "profiles" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "profiles_deleted_at_idx" ON "profiles" USING btree ("deleted_at");
CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "accounts_user_deleted_idx" ON "accounts" USING btree ("user_id","deleted_at");
CREATE INDEX IF NOT EXISTS "accounts_type_idx" ON "accounts" USING btree ("account_type");
CREATE INDEX IF NOT EXISTS "symbols_user_id_idx" ON "symbols" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "symbols_ticker_idx" ON "symbols" USING btree ("ticker");
CREATE INDEX IF NOT EXISTS "symbols_market_type_idx" ON "symbols" USING btree ("market_type");
CREATE UNIQUE INDEX IF NOT EXISTS "symbols_user_ticker_uidx" ON "symbols" USING btree ("user_id","ticker");
CREATE INDEX IF NOT EXISTS "symbols_deleted_at_idx" ON "symbols" USING btree ("deleted_at");
CREATE INDEX IF NOT EXISTS "strategies_user_id_idx" ON "strategies" USING btree ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "strategies_user_name_uidx" ON "strategies" USING btree ("user_id","name");
CREATE INDEX IF NOT EXISTS "strategies_deleted_at_idx" ON "strategies" USING btree ("deleted_at");
CREATE INDEX IF NOT EXISTS "trades_user_id_idx" ON "trades" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "trades_account_id_idx" ON "trades" USING btree ("account_id");
CREATE INDEX IF NOT EXISTS "trades_symbol_id_idx" ON "trades" USING btree ("symbol_id");
CREATE INDEX IF NOT EXISTS "trades_strategy_id_idx" ON "trades" USING btree ("strategy_id");
CREATE INDEX IF NOT EXISTS "trades_status_idx" ON "trades" USING btree ("status");
CREATE INDEX IF NOT EXISTS "trades_opened_at_idx" ON "trades" USING btree ("opened_at");
CREATE INDEX IF NOT EXISTS "trades_user_opened_idx" ON "trades" USING btree ("user_id","opened_at");
CREATE INDEX IF NOT EXISTS "trades_user_deleted_idx" ON "trades" USING btree ("user_id","deleted_at");
CREATE INDEX IF NOT EXISTS "trade_images_trade_id_idx" ON "trade_images" USING btree ("trade_id");
CREATE INDEX IF NOT EXISTS "trade_images_user_id_idx" ON "trade_images" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "trade_images_deleted_at_idx" ON "trade_images" USING btree ("deleted_at");
CREATE INDEX IF NOT EXISTS "trade_notes_trade_id_idx" ON "trade_notes" USING btree ("trade_id");
CREATE INDEX IF NOT EXISTS "trade_notes_user_id_idx" ON "trade_notes" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "trade_notes_deleted_at_idx" ON "trade_notes" USING btree ("deleted_at");
CREATE UNIQUE INDEX IF NOT EXISTS "trade_reviews_trade_id_uidx" ON "trade_reviews" USING btree ("trade_id");
CREATE INDEX IF NOT EXISTS "trade_reviews_user_id_idx" ON "trade_reviews" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "trade_reviews_deleted_at_idx" ON "trade_reviews" USING btree ("deleted_at");
CREATE INDEX IF NOT EXISTS "monthly_goals_user_id_idx" ON "monthly_goals" USING btree ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "monthly_goals_user_year_month_uidx" ON "monthly_goals" USING btree ("user_id","year","month");
CREATE INDEX IF NOT EXISTS "monthly_goals_status_idx" ON "monthly_goals" USING btree ("status");
CREATE INDEX IF NOT EXISTS "monthly_goals_deleted_at_idx" ON "monthly_goals" USING btree ("deleted_at");
CREATE INDEX IF NOT EXISTS "watchlists_user_id_idx" ON "watchlists" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "watchlists_symbol_id_idx" ON "watchlists" USING btree ("symbol_id");
CREATE UNIQUE INDEX IF NOT EXISTS "watchlists_user_list_symbol_uidx" ON "watchlists" USING btree ("user_id","list_name","symbol_id");
CREATE INDEX IF NOT EXISTS "watchlists_deleted_at_idx" ON "watchlists" USING btree ("deleted_at");
