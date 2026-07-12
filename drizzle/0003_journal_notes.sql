CREATE TABLE "journal_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" text NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"tags" text,
	"is_pinned" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "journal_notes" ADD CONSTRAINT "journal_notes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "journal_notes_user_id_idx" ON "journal_notes" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "journal_notes_user_pinned_idx" ON "journal_notes" USING btree ("user_id","is_pinned");
--> statement-breakpoint
CREATE INDEX "journal_notes_deleted_at_idx" ON "journal_notes" USING btree ("deleted_at");
