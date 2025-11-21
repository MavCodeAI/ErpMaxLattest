import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AppSettings {
  id: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  email_notifications: boolean;
  sales_alerts: boolean;
  inventory_alerts: boolean;
  employee_updates: boolean;
  dark_mode: boolean;
  compact_view: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // If no settings exist, create default
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from("settings")
          .insert({
            company_name: "ErpMax",
            company_email: "info@erpmax.com",
            company_phone: "+92 300 1234567",
            company_address: "Lahore, Pakistan",
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newSettings as AppSettings;
      }

      return data as AppSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updatedSettings: Partial<AppSettings>) => {
      if (!settings?.id) throw new Error("No settings found");

      const { data, error } = await supabase
        .from("settings")
        .update(updatedSettings)
        .eq("id", settings.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: () => {
      toast.loading("Saving settings...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to save settings: " + error.message);
    },
  });

  return {
    settings,
    isLoading,
    isError,
    updateSettings: updateSettings.mutate,
  };
};