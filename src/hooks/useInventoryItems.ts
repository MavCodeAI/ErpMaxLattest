import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLogger } from "./useLogger";

export interface InventoryItem {
  id: string;
  item_id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost_price?: number;
  stock: number;
  min_stock_level?: number;
  supplier?: string;
  supplier_id?: string;
  status?: string;
  features?: string;
  unit?: string;
  tax_rate?: number;
  category_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useInventoryItems = () => {
  const queryClient = useQueryClient();
  const { logInventoryAction } = useLogger();

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as InventoryItem[];
      return data as InventoryItem[];
    },
  });

  const createItem = useMutation({
    mutationFn: async (item: Omit<InventoryItem, "id">) => {
      const { data, error } = await supabase
        .from("inventory_items")
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data as InventoryItem;
    },
    onMutate: () => {
      toast.loading("Adding item...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast.success("Item added successfully");
      logInventoryAction("CREATE", data.id, { 
        name: data.name,
        category: data.category,
        stock: data.stock
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to add item: " + error.message);
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("inventory_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as InventoryItem;
    },
    onMutate: () => {
      toast.loading("Updating item...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast.success("Item updated successfully");
      logInventoryAction("UPDATE", data.id, { 
        name: data.name,
        category: data.category,
        stock: data.stock
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update item: " + error.message);
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: () => {
      toast.loading("Deleting item...");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast.success("Item deleted successfully");
      logInventoryAction("DELETE", variables);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete item: " + error.message);
    },
  });

  return {
    items,
    isLoading,
    isError,
    createItem: createItem.mutate,
    updateItem: updateItem.mutate,
    deleteItem: deleteItem.mutate,
  };
};
