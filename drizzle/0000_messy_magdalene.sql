CREATE TABLE "champions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(200),
	"region_id" integer,
	"quote" text,
	"biography" jsonb,
	"appearance" text,
	"personality" text,
	"abilities" text,
	"trivia" text,
	"key_facts" jsonb,
	"avatar_url" varchar(500),
	"bg_url" varchar(500),
	"role" varchar(50),
	"release_date" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "champions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(200),
	"description" text,
	"facts" jsonb,
	"coordinates" jsonb,
	"crest_image" varchar(500),
	"bg_image" varchar(500),
	"champion_slugs" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "regions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"champion_id_1" integer NOT NULL,
	"champion_id_2" integer,
	"champion_name_2" varchar(100),
	"type" varchar(50),
	"description" text,
	"source_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "champions" ADD CONSTRAINT "champions_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relations" ADD CONSTRAINT "relations_champion_id_1_champions_id_fk" FOREIGN KEY ("champion_id_1") REFERENCES "public"."champions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relations" ADD CONSTRAINT "relations_champion_id_2_champions_id_fk" FOREIGN KEY ("champion_id_2") REFERENCES "public"."champions"("id") ON DELETE cascade ON UPDATE no action;