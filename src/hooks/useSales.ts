import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SalesInvoice, InvoiceItem } from "@/types/sales";
import { useLogger } from "./useLogger";

export const useSales = () => {
  const queryClient = useQueryClient();
  const { logInvoiceAction } = useLogger();
  const parseItems = (rawItems: unknown): InvoiceItem[] => {
    if (!rawItems) return [];
    try {
      if (typeof rawItems === "string") {
        return JSON.parse(rawItems) as InvoiceItem[];
      }
      return Array.isArray(rawItems) ? (rawItems as InvoiceItem[]) : [];
    } catch (error) {
      console.error("Failed to parse invoice items", error);
      return [];
    }
  };

  const { data: invoices = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["sales-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_invoices")
        .select("*")
        .order("date", { ascending: false })
        .limit(50); // Limit to 50 most recent invoices for better performance
      if (error) throw error;
      return data.map(invoice => ({
        ...invoice,
        items: parseItems(invoice.items)
      })) as SalesInvoice[];
    },
  });

  // Fetch customers for the invoice dialog
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: Omit<SalesInvoice, "id">) => {
      const { data, error } = await supabase
        .from("sales_invoices")
        .insert({
          ...invoice,
          items: invoice.items ? JSON.stringify(invoice.items) : null
        })
        .select()
        .single();
      if (error) throw error;
      return {
        ...data,
        items: parseItems(data.items)
      } as SalesInvoice;
    },
    onMutate: () => {
      toast.loading("Creating invoice...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
      toast.success("Invoice created successfully");
      logInvoiceAction("CREATE", data.id, { 
        customer_name: data.customer_name,
        total_amount: data.total_amount,
        status: data.status
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create invoice: " + error.message);
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SalesInvoice> & { id: string }) => {
      // Prepare the update object with proper JSON serialization for items
      const { items, ...rest } = updates;
      type UpdatableInvoice = Partial<Omit<SalesInvoice, "items">> & { items?: string | null };
      const updateObject: UpdatableInvoice = {
        ...rest,
        ...(items !== undefined ? { items: items ? JSON.stringify(items) : null } : {}),
      };

      const { data, error } = await supabase
        .from("sales_invoices")
        .update(updateObject)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return {
        ...data,
        items: parseItems(data.items)
      } as SalesInvoice;
    },
    onMutate: () => {
      toast.loading("Updating invoice...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
      toast.success("Invoice updated successfully");
      logInvoiceAction("UPDATE", data.id, { 
        customer_name: data.customer_name,
        total_amount: data.total_amount,
        status: data.status
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update invoice: " + error.message);
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
    onMutate: () => {
      toast.loading("Deleting invoice...");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
      toast.success("Invoice deleted successfully");
      logInvoiceAction("DELETE", variables);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete invoice: " + error.message);
    },
  });

  return {
    invoices,
    customers,
    isLoading,
    customersLoading,
    isError,
    refreshInvoices: () => queryClient.invalidateQueries({ queryKey: ["sales-invoices"] }),
    refetchInvoices: refetch,
    createInvoice: createInvoice.mutate,
    createInvoiceAsync: createInvoice.mutateAsync,
    updateInvoice: updateInvoice.mutate,
    updateInvoiceAsync: updateInvoice.mutateAsync,
    deleteInvoice: deleteInvoice.mutate,
    deleteInvoiceAsync: deleteInvoice.mutateAsync,
  };
};
