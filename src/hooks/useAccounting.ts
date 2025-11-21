import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLogger } from "./useLogger";

export interface Transaction {
  id: string;
  transaction_id: string;
  type: "Income" | "Expense" | string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  payment_method?: string;
  reference?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useAccounting = () => {
  const queryClient = useQueryClient();
  const { logAction } = useLogger();

  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .limit(50); // Limit to 50 most recent transactions for better performance
      if (error) throw error;
      return data as Transaction[];
    },
  });

  const createTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, "id">) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert(transaction)
        .select()
        .single();
      if (error) throw error;
      return data as Transaction;
    },
    onMutate: () => {
      toast.loading("Creating transaction...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction created successfully");
      logAction("CREATE", "transaction", data.id, { 
        type: data.type,
        category: data.category,
        amount: data.amount
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create transaction: " + error.message);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Transaction;
    },
    onMutate: () => {
      toast.loading("Updating transaction...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction updated successfully");
      logAction("UPDATE", "transaction", data.id, { 
        type: data.type,
        category: data.category,
        amount: data.amount
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update transaction: " + error.message);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: () => {
      toast.loading("Deleting transaction...");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction deleted successfully");
      logAction("DELETE", "transaction", variables);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete transaction: " + error.message);
    },
  });

  return {
    transactions,
    isLoading,
    isError,
    createTransaction: createTransaction.mutate,
    updateTransaction: updateTransaction.mutate,
    deleteTransaction: deleteTransaction.mutate,
  };
};
