import { useMemo } from 'react';
import type { InventoryItem } from '@/hooks/useInventoryItems';

interface CategorySummary {
  name: string;
  items: number;
  value: number;
}

// Utility functions for inventory calculations
export const calculateTotalValue = (items: InventoryItem[]): number => {
  return items.reduce(
    (sum, item) => sum + Number(item.price ?? 0) * Number(item.stock ?? 0),
    0
  );
};

export const calculateLowStockItems = (items: InventoryItem[]): InventoryItem[] => {
  return items.filter(item => Number(item.stock ?? 0) <= (item.min_stock_level ?? 10));
};

export const calculateCostOfGoods = (items: InventoryItem[]): number => {
  return items.reduce(
    (sum, item) => sum + Number(item.cost_price ?? 0) * Number(item.stock ?? 0),
    0
  );
};

export const getItemsByCategory = (items: InventoryItem[]): CategorySummary[] => {
  const categoryMap = new Map<string, { count: number; value: number }>();

  items.forEach(item => {
    const category = item.category || 'Uncategorized';
    const current = categoryMap.get(category) || { count: 0, value: 0 };
    categoryMap.set(category, {
      count: current.count + 1,
      value: current.value + Number(item.price ?? 0) * Number(item.stock ?? 0)
    });
  });

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    name: category,
    items: data.count,
    value: data.value
  }));
};

// Memoized versions of the functions for use in React components
export const useTotalValue = (items: InventoryItem[]): number => {
  return useMemo(() => calculateTotalValue(items), [items]);
};

export const useLowStockItems = (items: InventoryItem[]): InventoryItem[] => {
  return useMemo(() => calculateLowStockItems(items), [items]);
};

export const useCostOfGoods = (items: InventoryItem[]): number => {
  return useMemo(() => calculateCostOfGoods(items), [items]);
};

export const useItemsByCategory = (items: InventoryItem[]): CategorySummary[] => {
  return useMemo(() => getItemsByCategory(items), [items]);
};