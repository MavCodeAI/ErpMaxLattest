import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  lowStockItems: number;
}

// Optimized hook for dashboard that only fetches summary statistics
export const useDashboardData = () => {
  // Fetch only essential dashboard statistics
  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      // Get total revenue (from sales_invoices table)
      const { data: revenueData, error: revenueError } = await supabase
        .from("sales_invoices")
        .select("total_amount")
        .limit(1000); // Still keep some limit for performance

      if (revenueError) throw revenueError;

      // Get recent transactions for expenses (limited to recent ones)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("type, amount")
        .order("date", { ascending: false })
        .limit(100); // Only recent transactions

      if (transactionsError) throw transactionsError;

      // Calculate totals
      const totalRevenue = revenueData.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
      const totalExpenses = transactionsData
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      // Get low stock items count (optimized query)
      const { count: lowStockCount, error: inventoryError } = await supabase
        .from("inventory_items")
        .select("*", { count: 'exact', head: true })
        .lt('stock', 10); // Items with stock < 10

      if (inventoryError) throw inventoryError;

      return {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        lowStockItems: lowStockCount || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    summary,
    isLoading: summaryLoading,
    isError: summaryError,
  };
};
