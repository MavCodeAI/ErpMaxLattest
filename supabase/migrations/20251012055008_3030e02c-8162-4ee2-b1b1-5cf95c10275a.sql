-- Create enum for order status
CREATE TYPE public.crm_order_status AS ENUM ('pending', 'in_progress', 'delivered', 'cancelled');

-- Create enum for message direction
CREATE TYPE public.crm_message_direction AS ENUM ('incoming', 'outgoing');

-- Create enum for message status
CREATE TYPE public.crm_message_status AS ENUM ('sent', 'delivered', 'read', 'failed');

-- CRM Customers Table
CREATE TABLE public.crm_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- CRM Orders Table
CREATE TABLE public.crm_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE NOT NULL,
  order_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  total_amount NUMERIC DEFAULT 0 NOT NULL,
  status crm_order_status DEFAULT 'pending' NOT NULL,
  items JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- CRM Messages Table
CREATE TABLE public.crm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE NOT NULL,
  direction crm_message_direction NOT NULL,
  content TEXT NOT NULL,
  status crm_message_status DEFAULT 'sent' NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  whatsapp_message_id TEXT,
  provider_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- WhatsApp Providers Table
CREATE TABLE public.crm_whatsapp_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  api_key TEXT NOT NULL,
  api_secret TEXT,
  phone_number TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- CRM Activity Logs Table
CREATE TABLE public.crm_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.crm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_whatsapp_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allowing all operations for now, will add auth later)
CREATE POLICY "Anyone can manage customers" ON public.crm_customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage orders" ON public.crm_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage messages" ON public.crm_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage providers" ON public.crm_whatsapp_providers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can view activity logs" ON public.crm_activity_logs FOR SELECT USING (true);
CREATE POLICY "System can insert activity logs" ON public.crm_activity_logs FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_crm_customers_whatsapp ON public.crm_customers(whatsapp_number);
CREATE INDEX idx_crm_orders_customer ON public.crm_orders(customer_id);
CREATE INDEX idx_crm_orders_status ON public.crm_orders(status);
CREATE INDEX idx_crm_messages_customer ON public.crm_messages(customer_id);
CREATE INDEX idx_crm_messages_created ON public.crm_messages(created_at DESC);
CREATE INDEX idx_crm_activity_logs_customer ON public.crm_activity_logs(customer_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_crm_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_crm_customers_updated_at
  BEFORE UPDATE ON public.crm_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_crm_updated_at();

CREATE TRIGGER update_crm_orders_updated_at
  BEFORE UPDATE ON public.crm_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_crm_updated_at();

CREATE TRIGGER update_crm_providers_updated_at
  BEFORE UPDATE ON public.crm_whatsapp_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_crm_updated_at();

-- Function to log customer activity
CREATE OR REPLACE FUNCTION public.log_crm_activity(
  p_customer_id UUID,
  p_activity_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.crm_activity_logs (customer_id, activity_type, description, metadata)
  VALUES (p_customer_id, p_activity_type, p_description, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;