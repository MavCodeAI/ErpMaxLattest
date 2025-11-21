import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLogger } from "./useLogger";

export interface PurchaseOrder {
  id: string;
  order_id: string;
  supplier_id?: string;
  supplier_name: string;
  supplier_contact?: string;
  items?: PurchaseItem[];
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  status: string;
  date: string;
  expected_delivery_date?: string;
  notes?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_id?: string;
}

export const usePurchase = () => {
  const queryClient = useQueryClient();
  const { logPurchaseAction } = useLogger();

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as PurchaseOrder[];
    },
  });

  const createOrder = useMutation({
    mutationFn: async (order: Omit<PurchaseOrder, "id">) => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .insert(order)
        .select()
        .single();
      if (error) throw error;
      return data as PurchaseOrder;
    },
    onMutate: () => {
      toast.loading("Creating purchase order...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order created successfully");
      logPurchaseAction("CREATE", data.id, { 
        supplier_name: data.supplier_name,
        total_amount: data.total_amount,
        status: data.status
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create purchase order: " + error.message);
    },
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PurchaseOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as PurchaseOrder;
    },
    onMutate: () => {
      toast.loading("Updating purchase order...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order updated successfully");
      logPurchaseAction("UPDATE", data.id, { 
        supplier_name: data.supplier_name,
        total_amount: data.total_amount,
        status: data.status
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update purchase order: " + error.message);
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("purchase_orders")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: () => {
      toast.loading("Deleting purchase order...");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order deleted successfully");
      logPurchaseAction("DELETE", variables);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete purchase order: " + error.message);
    },
  });

  return {
    orders,
    isLoading,
    isError,
    createOrder: createOrder.mutate,
    updateOrder: updateOrder.mutate,
    deleteOrder: deleteOrder.mutate,
  };
};