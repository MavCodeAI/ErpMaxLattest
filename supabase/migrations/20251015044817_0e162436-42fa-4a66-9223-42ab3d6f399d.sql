-- Add new columns to inventory_items table
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS features text,
ADD COLUMN IF NOT EXISTS unit text DEFAULT 'Pieces',
ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES suppliers(id),
ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock_level integer DEFAULT 10;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_supplier ON inventory_items(supplier_id);

-- Add a trigger to check low stock
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.stock <= NEW.min_stock_level THEN
    -- You can add notification logic here in the future
    NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_check_low_stock
AFTER INSERT OR UPDATE OF stock ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION check_low_stock();

-- Add sales pipeline table for CRM
CREATE TABLE IF NOT EXISTS crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES crm_customers(id) ON DELETE CASCADE,
  title text NOT NULL,
  value numeric DEFAULT 0,
  stage text NOT NULL DEFAULT 'new',
  probability integer DEFAULT 0,
  expected_close_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage leads"
ON crm_leads
FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for leads updated_at
CREATE TRIGGER update_crm_leads_updated_at
BEFORE UPDATE ON crm_leads
FOR EACH ROW
EXECUTE FUNCTION update_crm_updated_at();