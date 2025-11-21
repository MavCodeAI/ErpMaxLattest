import { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import { useSales } from "@/hooks/useSales";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { usePurchase } from "@/hooks/usePurchase";
import { useAccounting } from "@/hooks/useAccounting";
import { useHR } from "@/hooks/useHR";
import { useProjects } from "@/hooks/useProjects";
import { useParties } from "@/hooks/useParties";

interface SearchItem {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchItem[];
  isSearching: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Debounce utility
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query to avoid excessive re-renders
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch all data - these hooks should handle their own loading/caching
  const { invoices } = useSales();
  const { items } = useInventoryItems();
  const { orders } = usePurchase();
  const { transactions } = useAccounting();
  const { employees } = useHR();
  const { projects } = useProjects();
  const { parties } = useParties();

  // Memoized search function
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) return [];

    const searchQuery = query.toLowerCase().trim();
    const results: SearchItem[] = [];

    // Search invoices
    invoices.forEach(invoice => {
      if (
        invoice.invoice_id.toLowerCase().includes(searchQuery) ||
        invoice.customer_name.toLowerCase().includes(searchQuery)
      ) {
        results.push({
          id: invoice.id,
          title: `Invoice ${invoice.invoice_id}`,
          description: `Customer: ${invoice.customer_name}, Amount: $${Number(invoice.total_amount).toLocaleString()}`,
          type: "Invoice",
          url: "/sales",
        });
      }
    });

    // Search inventory items
    items.forEach(item => {
      if (
        item.item_id.toLowerCase().includes(searchQuery) ||
        item.name.toLowerCase().includes(searchQuery) ||
        item.category.toLowerCase().includes(searchQuery)
      ) {
        results.push({
          id: item.id,
          title: `Item ${item.name}`,
          description: `ID: ${item.item_id}, Category: ${item.category}, Stock: ${item.stock}`,
          type: "Inventory Item",
          url: "/inventory",
        });
      }
    });

    // Search purchase orders
    orders.forEach(order => {
      if (
        order.order_id.toLowerCase().includes(searchQuery) ||
        order.supplier_name.toLowerCase().includes(searchQuery)
      ) {
        results.push({
          id: order.id,
          title: `Purchase Order ${order.order_id}`,
          description: `Supplier: ${order.supplier_name}, Amount: $${Number(order.total_amount).toLocaleString()}`,
          type: "Purchase Order",
          url: "/purchase",
        });
      }
    });

    // Search transactions
    transactions.forEach(transaction => {
      if (
        transaction.transaction_id.toLowerCase().includes(searchQuery) ||
        transaction.category.toLowerCase().includes(searchQuery)
      ) {
        results.push({
          id: transaction.id,
          title: `Transaction ${transaction.transaction_id}`,
          description: `Type: ${transaction.type}, Category: ${transaction.category}, Amount: $${Number(transaction.amount).toLocaleString()}`,
          type: "Transaction",
          url: "/accounting",
        });
      }
    });

    // Search employees
    employees.forEach(employee => {
      if (
        employee.employee_id.toLowerCase().includes(searchQuery) ||
        employee.name.toLowerCase().includes(searchQuery) ||
        employee.department.toLowerCase().includes(searchQuery)
      ) {
        results.push({
          id: employee.id,
          title: `Employee ${employee.name}`,
          description: `ID: ${employee.employee_id}, Department: ${employee.department}, Position: ${employee.position}`,
          type: "Employee",
          url: "/hr",
        });
      }
    });

    // Search projects
    projects.forEach(project => {
      if (
        project.project_id.toLowerCase().includes(searchQuery) ||
        project.name.toLowerCase().includes(searchQuery)
      ) {
        results.push({
          id: project.id,
          title: `Project ${project.name}`,
          description: `ID: ${project.project_id}, Status: ${project.status}, Budget: $${Number(project.budget).toLocaleString()}`,
          type: "Project",
          url: "/projects",
        });
      }
    });

    // Search parties (customers/suppliers)
    parties.forEach(party => {
      if (
        party.name.toLowerCase().includes(searchQuery) ||
        party.email?.toLowerCase().includes(searchQuery) ||
        party.phone?.toLowerCase().includes(searchQuery)
      ) {
        results.push({
          id: party.id,
          title: `Party ${party.name}`,
          description: `${party.email || 'No email'}, ${party.phone || 'No phone'}`,
          type: "Party",
          url: "/parties",
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [invoices, items, orders, transactions, employees, projects, parties]);

  // Perform search with proper loading state management
  const searchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return [];

    const results = performSearch(debouncedSearchQuery);
    return results;
  }, [debouncedSearchQuery, performSearch]);

  // Manage loading state based on search activity
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setIsSearching(true);
      // Simulate async search delay
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 200); // Longer delay for better UX

      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [debouncedSearchQuery]);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
