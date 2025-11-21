import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Party {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: "customer" | "supplier";
  created_at: string;
  updated_at: string;
}

export const useParties = () => {
  const queryClient = useQueryClient();

  const { data: parties = [], isLoading, isError } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      // Fetch customers
      const { data: customers, error: customersError } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });

      if (customersError) throw customersError;

      // Fetch suppliers
      const { data: suppliers, error: suppliersError } = await supabase
        .from("suppliers")
        .select("*")
        .order("name", { ascending: true });

      if (suppliersError) throw suppliersError;

      // Combine and format data
      const formattedCustomers = customers.map(customer => ({
        ...customer,
        type: "customer" as const
      }));

      const formattedSuppliers = suppliers.map(supplier => ({
        ...supplier,
        type: "supplier" as const
      }));

      return [...formattedCustomers, ...formattedSuppliers] as Party[];
    },
  });

  const createParty = useMutation({
    mutationFn: async (party: Omit<Party, "id" | "created_at" | "updated_at">) => {
      if (party.type === "customer") {
        const { data, error } = await supabase
          .from("customers")
          .insert({
            name: party.name,
            email: party.email,
            phone: party.phone,
            address: party.address,
            customer_id: `CUST-${Date.now()}` // Generate a simple ID
          })
          .select()
          .single();

        if (error) throw error;
        return { ...data, type: "customer" } as Party;
      } else {
        const { data, error } = await supabase
          .from("suppliers")
          .insert({
            name: party.name,
            email: party.email,
            phone: party.phone,
            address: party.address,
            supplier_id: `SUPP-${Date.now()}` // Generate a simple ID
          })
          .select()
          .single();

        if (error) throw error;
        return { ...data, type: "supplier" } as Party;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      toast.success("Party created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create party: " + error.message);
    },
  });

  const updateParty = useMutation({
    mutationFn: async (party: Partial<Party> & { id: string, type: "customer" | "supplier" }) => {
      if (party.type === "customer") {
        const { data, error } = await supabase
          .from("customers")
          .update({
            name: party.name,
            email: party.email,
            phone: party.phone,
            address: party.address
          })
          .eq("id", party.id)
          .select()
          .single();

        if (error) throw error;
        return { ...data, type: "customer" } as Party;
      } else {
        const { data, error } = await supabase
          .from("suppliers")
          .update({
            name: party.name,
            email: party.email,
            phone: party.phone,
            address: party.address
          })
          .eq("id", party.id)
          .select()
          .single();

        if (error) throw error;
        return { ...data, type: "supplier" } as Party;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      toast.success("Party updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update party: " + error.message);
    },
  });

  const deleteParty = useMutation({
    mutationFn: async (party: Party) => {
      if (party.type === "customer") {
        const { error } = await supabase
          .from("customers")
          .delete()
          .eq("id", party.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("suppliers")
          .delete()
          .eq("id", party.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      toast.success("Party deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete party: " + error.message);
    },
  });

  return {
    parties,
    isLoading,
    isError,
    createParty: createParty.mutate,
    updateParty: updateParty.mutate,
    deleteParty: deleteParty.mutate,
  };
};