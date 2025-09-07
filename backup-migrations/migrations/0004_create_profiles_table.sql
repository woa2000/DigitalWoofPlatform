-- Create profiles table
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	"full_name" text,
	"avatar_url" text,
	"business_name" text,
	"business_type" text,
	"phone" text,
	"website" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text DEFAULT 'BR',
	"plan_type" text DEFAULT 'free',
	"subscription_status" text DEFAULT 'active',
	"subscription_end_date" timestamp,
	"onboarding_completed" boolean DEFAULT false,
	"onboarding_step" text DEFAULT 'welcome',
	"timezone" text DEFAULT 'America/Sao_Paulo',
	"language" text DEFAULT 'pt-BR',
	"notifications" jsonb DEFAULT '{"email": true, "browser": true, "marketing": false}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_profiles_business_type" ON "profiles" ("business_type");
CREATE INDEX IF NOT EXISTS "idx_profiles_plan_type" ON "profiles" ("plan_type");
CREATE INDEX IF NOT EXISTS "idx_profiles_onboarding_completed" ON "profiles" ("onboarding_completed");
CREATE INDEX IF NOT EXISTS "idx_profiles_created_at" ON "profiles" ("created_at");

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;