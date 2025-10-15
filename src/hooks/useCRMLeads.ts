import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CRMLead {
  id: string;
  customer_id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useCRMLeads = () => {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ["crm-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_leads")
        .select(`
          *,
          crm_customers (
            id,
            name,
            customer_id,
            whatsapp_number
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CRMLead[];
    },
  });

  const addLead = useMutation({
    mutationFn: async (lead: Omit<CRMLead, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("crm_leads")
        .insert(lead)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      toast.success("Lead added successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to add lead: " + error.message);
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...lead }: Partial<CRMLead> & { id: string }) => {
      const { data, error } = await supabase
        .from("crm_leads")
        .update(lead)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      toast.success("Lead updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update lead: " + error.message);
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("crm_leads")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      toast.success("Lead deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete lead: " + error.message);
    },
  });

  return {
    leads,
    loadingLeads,
    addLead: addLead.mutate,
    updateLead: updateLead.mutate,
    deleteLead: deleteLead.mutate,
  };
};
