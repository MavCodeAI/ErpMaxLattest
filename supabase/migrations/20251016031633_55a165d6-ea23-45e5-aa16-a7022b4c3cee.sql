-- Create categories table for products
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create price_lists table for store-specific pricing
CREATE TABLE IF NOT EXISTS public.price_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_percent numeric DEFAULT 0,
  fixed_price numeric DEFAULT 0,
  product_id uuid REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  store_id uuid REFERENCES public.customers(id) ON DELETE CASCADE,
  valid_from date,
  valid_to date,
  priority integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add category_id to inventory_items
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add price_list_id to customers (stores)
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS assigned_price_list_id uuid REFERENCES public.price_lists(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS store_type text DEFAULT 'Retailer',
ADD COLUMN IF NOT EXISTS credit_limit numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_terms text;

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can manage categories" 
ON public.categories 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Anyone can manage price lists" 
ON public.price_lists 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_price_lists_store_id ON public.price_lists(store_id);
CREATE INDEX IF NOT EXISTS idx_price_lists_product_id ON public.price_lists(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category_id ON public.inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_customers_price_list ON public.customers(assigned_price_list_id);

-- Add trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_inventory_updated_at();

-- Add trigger for price_lists updated_at
CREATE TRIGGER update_price_lists_updated_at
BEFORE UPDATE ON public.price_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_inventory_updated_at();