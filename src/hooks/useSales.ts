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

export interface SalesInvoice {
  id: string;
  invoice_id: string;
  customer_id?: string;
  customer_name: string;
  total_amount: number;
  status: string;
  date: string;
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
      return data as SalesInvoice[];
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
      const { data, error } = await supabase
        .from("sales_invoices")
        .insert(invoice)
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
      const { data, error } = await supabase
        .from("sales_invoices")
        .update(invoice)
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
