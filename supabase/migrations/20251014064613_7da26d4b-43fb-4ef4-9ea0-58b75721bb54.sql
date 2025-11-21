-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on profiles and user_roles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_settings_updated_at();

-- CRM enhancements: Message templates
CREATE TABLE public.crm_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  variables JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage templates"
  ON public.crm_message_templates FOR ALL
  USING (true) WITH CHECK (true);

-- Customer tags
CREATE TABLE public.crm_customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_customer_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage tags"
  ON public.crm_customer_tags FOR ALL
  USING (true) WITH CHECK (true);

-- Customer tag assignments
CREATE TABLE public.crm_customer_tag_assignments (
  customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.crm_customer_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (customer_id, tag_id)
);

ALTER TABLE public.crm_customer_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage tag assignments"
  ON public.crm_customer_tag_assignments FOR ALL
  USING (true) WITH CHECK (true);

-- Conversation metadata
CREATE TABLE public.crm_conversation_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE UNIQUE,
  is_starred BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  assigned_to TEXT,
  last_message_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_conversation_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage conversation metadata"
  ON public.crm_conversation_metadata FOR ALL
  USING (true) WITH CHECK (true);

-- Quick replies
CREATE TABLE public.crm_quick_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shortcut TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  is_shared BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_quick_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage quick replies"
  ON public.crm_quick_replies FOR ALL
  USING (true) WITH CHECK (true);

-- Update triggers for new tables
CREATE TRIGGER update_crm_templates_updated_at
  BEFORE UPDATE ON public.crm_message_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_crm_updated_at();

CREATE TRIGGER update_crm_conversation_metadata_updated_at
  BEFORE UPDATE ON public.crm_conversation_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_crm_updated_at();