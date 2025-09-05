CREATE TABLE "ai_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"campaign_id" uuid,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"prompt" text NOT NULL,
	"brand_voice_id" uuid,
	"compliance_status" text NOT NULL,
	"compliance_score" numeric(3, 2),
	"human_review_required" boolean DEFAULT false,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anamnesis_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"primary_url" text NOT NULL,
	"status" text NOT NULL,
	"score_completeness" numeric(5, 2),
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anamnesis_finding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_id" uuid NOT NULL,
	"key" text NOT NULL,
	"section" text NOT NULL,
	"payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anamnesis_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_id" uuid NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"normalized_url" text NOT NULL,
	"provider" text,
	"last_fetched_at" timestamp,
	"hash" text NOT NULL,
	CONSTRAINT "anamnesis_source_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "brand_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_onboarding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"logo_url" text,
	"palette" jsonb,
	"logo_metadata" jsonb,
	"tone_config" jsonb NOT NULL,
	"language_config" jsonb NOT NULL,
	"brand_values" jsonb,
	"step_completed" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "brand_onboarding_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "brand_voices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"tone" text NOT NULL,
	"persona" jsonb NOT NULL,
	"values" jsonb NOT NULL,
	"guidelines" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_anamnesis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"responses" jsonb NOT NULL,
	"analysis" jsonb,
	"recommendations" jsonb,
	"score" integer,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"channels" jsonb NOT NULL,
	"target_audience" jsonb NOT NULL,
	"metrics" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid NOT NULL,
	"category" text NOT NULL,
	"severity" text NOT NULL,
	"rule" text NOT NULL,
	"passed" boolean NOT NULL,
	"message" text,
	"suggestion" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"business_type" text NOT NULL,
	"business_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_content" ADD CONSTRAINT "ai_content_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content" ADD CONSTRAINT "ai_content_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content" ADD CONSTRAINT "ai_content_brand_voice_id_brand_voices_id_fk" FOREIGN KEY ("brand_voice_id") REFERENCES "public"."brand_voices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anamnesis_analysis" ADD CONSTRAINT "anamnesis_analysis_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anamnesis_finding" ADD CONSTRAINT "anamnesis_finding_analysis_id_anamnesis_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."anamnesis_analysis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anamnesis_source" ADD CONSTRAINT "anamnesis_source_analysis_id_anamnesis_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."anamnesis_analysis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_assets" ADD CONSTRAINT "brand_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_onboarding" ADD CONSTRAINT "brand_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_voices" ADD CONSTRAINT "brand_voices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_anamnesis" ADD CONSTRAINT "business_anamnesis_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_content_id_ai_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."ai_content"("id") ON DELETE no action ON UPDATE no action;