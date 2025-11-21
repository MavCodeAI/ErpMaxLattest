-- Create inventory_items table for CRUD operations
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'In Stock',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read inventory items (public data)
CREATE POLICY "Anyone can view inventory items" 
ON public.inventory_items 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert inventory items
CREATE POLICY "Anyone can insert inventory items" 
ON public.inventory_items 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to update inventory items
CREATE POLICY "Anyone can update inventory items" 
ON public.inventory_items 
FOR UPDATE 
USING (true);

-- Create policy to allow anyone to delete inventory items
CREATE POLICY "Anyone can delete inventory items" 
ON public.inventory_items 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.update_inventory_updated_at();

-- Insert sample data
INSERT INTO public.inventory_items (item_id, name, category, stock, price, status) VALUES
('ITM-001', 'Laptop Dell XPS', 'Electronics', 15, 85000, 'In Stock'),
('ITM-002', 'Office Chair', 'Furniture', 5, 12000, 'Low Stock'),
('ITM-003', 'Printer HP LaserJet', 'Electronics', 8, 35000, 'In Stock'),
('ITM-004', 'Desk Lamp', 'Accessories', 2, 3500, 'Low Stock'),
('ITM-005', 'Mouse Logitech', 'Accessories', 45, 2500, 'In Stock');