import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export const useSales = () => {
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["sales-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_invoices")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data.map(invoice => ({
        ...invoice,
        items: invoice.items as unknown as InvoiceItem[]
      })) as SalesInvoice[];
    },
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Customer[];
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: Omit<SalesInvoice, "id">) => {
      const invoiceData = {
        ...invoice,
        items: invoice.items as any
      };
      const { data, error } = await supabase
        .from("sales_invoices")
        .insert(invoiceData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
      toast.success("Invoice created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create invoice: " + error.message);
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...invoice }: Partial<SalesInvoice> & { id: string }) => {
      const invoiceData = {
        ...invoice,
        items: invoice.items as any
      };
      const { data, error } = await supabase
        .from("sales_invoices")
        .update(invoiceData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
      toast.success("Invoice updated successfully");
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sales_invoices")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
      toast.success("Invoice deleted successfully");
    },
  });

  return {
    invoices,
    customers,
    isLoading: invoicesLoading || customersLoading,
    createInvoice: createInvoice.mutate,
    updateInvoice: updateInvoice.mutate,
    deleteInvoice: deleteInvoice.mutate,
  };
};
