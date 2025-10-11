import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Supplier {
  id: string;
  supplier_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PurchaseOrder {
  id: string;
  order_id: string;
  supplier_id?: string;
  supplier_name: string;
  total_amount: number;
  status: string;
  date: string;
}

export const usePurchase = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
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

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Supplier[];
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create order: " + error.message);
    },
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, ...order }: Partial<PurchaseOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .update(order)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Order updated successfully");
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Order deleted successfully");
    },
  });

  return {
    orders,
    suppliers,
    isLoading: ordersLoading || suppliersLoading,
    createOrder: createOrder.mutate,
    updateOrder: updateOrder.mutate,
    deleteOrder: deleteOrder.mutate,
  };
};
