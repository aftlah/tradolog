-- Mentor mode: owner → mentor journal share grants (read-only after accept).
CREATE TYPE "public"."share_status" AS ENUM('pending', 'active', 'revoked');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "journal_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"owner_user_id" text NOT NULL,
	"mentor_user_id" text,
	"mentor_email" text NOT NULL,
	"invite_token" text NOT NULL,
	"status" "share_status" DEFAULT 'pending' NOT NULL,
	"message" text,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "journal_shares" ADD CONSTRAINT "journal_shares_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "journal_shares" ADD CONSTRAINT "journal_shares_mentor_user_id_user_id_fk" FOREIGN KEY ("mentor_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "journal_shares_invite_token_uidx" ON "journal_shares" USING btree ("invite_token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_shares_owner_user_id_idx" ON "journal_shares" USING btree ("owner_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_shares_mentor_user_id_idx" ON "journal_shares" USING btree ("mentor_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_shares_mentor_email_idx" ON "journal_shares" USING btree ("mentor_email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_shares_status_idx" ON "journal_shares" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_shares_deleted_at_idx" ON "journal_shares" USING btree ("deleted_at");
