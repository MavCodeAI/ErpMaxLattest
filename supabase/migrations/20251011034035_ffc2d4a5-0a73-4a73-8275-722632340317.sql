-- Create settings table
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'ErpMax',
  company_email TEXT NOT NULL DEFAULT 'info@erpmax.com',
  company_phone TEXT NOT NULL DEFAULT '+92 300 1234567',
  company_address TEXT NOT NULL DEFAULT 'Lahore, Pakistan',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sales_alerts BOOLEAN NOT NULL DEFAULT true,
  inventory_alerts BOOLEAN NOT NULL DEFAULT true,
  employee_updates BOOLEAN NOT NULL DEFAULT false,
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  compact_view BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read settings
CREATE POLICY "Anyone can view settings" 
ON public.settings 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to update settings
CREATE POLICY "Anyone can update settings" 
ON public.settings 
FOR UPDATE 
USING (true);

-- Create policy to allow anyone to insert settings
CREATE POLICY "Anyone can insert settings" 
ON public.settings 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_settings_updated_at();

-- Insert default settings
INSERT INTO public.settings (company_name, company_email, company_phone, company_address) 
VALUES ('ErpMax', 'info@erpmax.com', '+92 300 1234567', 'Lahore, Pakistan');