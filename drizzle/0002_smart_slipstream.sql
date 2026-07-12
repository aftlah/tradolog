CREATE TYPE "public"."trade_session" AS ENUM('asian', 'london', 'new_york', 'overlap');--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "session" "trade_session";