-- Add comprehensive invoice fields to sales_invoices table

-- Customer details
ALTER TABLE public.sales_invoices 
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS customer_email text,
ADD COLUMN IF NOT EXISTS billing_address text,
ADD COLUMN IF NOT EXISTS shipping_address text;

-- Product/service details (stored as JSON array)
ALTER TABLE public.sales_invoices 
ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;

-- Financial breakdown
ALTER TABLE public.sales_invoices 
ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;

-- Payment details
ALTER TABLE public.sales_invoices 
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Unpaid',
ADD COLUMN IF NOT EXISTS transaction_id text;

-- Additional fields
ALTER TABLE public.sales_invoices 
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS invoice_type text DEFAULT 'Sale',
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer_phone ON public.sales_invoices(customer_phone);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_payment_status ON public.sales_invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_created_by ON public.sales_invoices(created_by);