export interface Customer {
  id: string;
  customer_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_id?: string;
}

export interface SalesInvoice {
  id: string;
  invoice_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  billing_address?: string;
  shipping_address?: string;
  items?: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method?: string;
  payment_status: string;
  transaction_id?: string;
  notes?: string;
  invoice_type: string;
  status: string;
  date: string;
  created_by?: string;
}