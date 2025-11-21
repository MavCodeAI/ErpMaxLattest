import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PriceList {
  id: string;
  name: string;
  type: string;
  discount_percent: number;
  fixed_price: number;
  product_id?: string;
  store_id?: string;
  valid_from?: string;
  valid_to?: string;
  priority: number;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const usePriceLists = () => {
  const queryClient = useQueryClient();

  const { data: priceLists = [], isLoading: priceListsLoading, isError: priceListsError } = useQuery({
    queryKey: ["price-lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("price_lists")
        .select("*")
        .order("priority", { ascending: false });
      if (error) throw error;
      return data as PriceList[];
    },
  });

  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Category[];
    },
  });

  const createPriceList = useMutation({
    mutationFn: async (priceList: Omit<PriceList, "id">) => {
      const { data, error } = await supabase
        .from("price_lists")
        .insert(priceList)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: () => {
      toast.loading("Creating price list...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-lists"] });
      toast.success("Price list created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create price list: " + error.message);
    },
  });

  const createCategory = useMutation({
    mutationFn: async (category: Omit<Category, "id">) => {
      const { data, error } = await supabase
        .from("categories")
        .insert(category)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: () => {
      toast.loading("Creating category...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create category: " + error.message);
    },
  });

  // Smart pricing calculation function
  const calculatePrice = (
    basePrice: number,
    storeId: string,
    productId: string
  ): number => {
    // Find applicable price rules
    const applicableRules = priceLists
      .filter(rule => 
        rule.is_active &&
        (rule.store_id === storeId || !rule.store_id) &&
        (rule.product_id === productId || !rule.product_id) &&
        (!rule.valid_from || new Date(rule.valid_from) <= new Date()) &&
        (!rule.valid_to || new Date(rule.valid_to) >= new Date())
      )
      .sort((a, b) => {
        // Prioritize product-specific rules
        if (a.product_id && !b.product_id) return -1;
        if (!a.product_id && b.product_id) return 1;
        // Then by priority
        return b.priority - a.priority;
      });

    if (applicableRules.length === 0) return basePrice;

    const rule = applicableRules[0];
    
    if (rule.type === 'fixed' && rule.fixed_price > 0) {
      return rule.fixed_price;
    } else if (rule.type === 'percentage' && rule.discount_percent > 0) {
      return basePrice * (1 - rule.discount_percent / 100);
    }

    return basePrice;
  };

  return {
    priceLists,
    categories,
    isLoading: priceListsLoading || categoriesLoading,
    isError: priceListsError || categoriesError,
    createPriceList: createPriceList.mutate,
    createCategory: createCategory.mutate,
    calculatePrice,
  };
};