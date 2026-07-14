-- Standing risk rules (1:1 per user). Separated from monthly goals.
CREATE TABLE IF NOT EXISTS "risk_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"max_daily_loss_amount" numeric(18, 8),
	"max_daily_loss_percent" numeric(8, 4),
	"max_weekly_loss_amount" numeric(18, 8),
	"max_weekly_loss_percent" numeric(8, 4),
	"max_trades_per_day" integer,
	"max_consecutive_losses" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "risk_rules" ADD CONSTRAINT "risk_rules_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "risk_rules_user_id_uidx" ON "risk_rules" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "risk_rules_deleted_at_idx" ON "risk_rules" USING btree ("deleted_at");
