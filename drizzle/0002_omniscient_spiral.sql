ALTER TABLE "relations" ADD COLUMN "strength" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "relations" ADD COLUMN "bidirectional" boolean DEFAULT true NOT NULL;