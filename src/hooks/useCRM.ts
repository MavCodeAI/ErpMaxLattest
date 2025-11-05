import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CRMCustomer {
  id: string;
  customer_id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CRMOrder {
  id: string;
  order_id: string;
  customer_id: string;
  order_date: string;
  total_amount: number;
  status: 'pending' | 'in_progress' | 'delivered' | 'cancelled';
  items?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CRMMessage {
  id: string;
  message_id: string;
  customer_id: string;
  direction: 'incoming' | 'outgoing';
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  is_read: boolean;
  whatsapp_message_id?: string;
  provider_name?: string;
  created_at: string;
}

export interface WhatsAppProvider {
  id: string;
  name: string;
  provider_type: string;
  api_key: string;
  api_secret?: string;
  phone_number?: string;
  webhook_url?: string;
  is_active: boolean;
  config?: any;
  created_at: string;
  updated_at: string;
}

export const useCRM = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Customers
  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ["crm-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_customers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as CRMCustomer[];
    },
  });

  const addCustomer = useMutation({
    mutationFn: async (customer: Omit<CRMCustomer, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("crm_customers")
        .insert([customer])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-customers"] });
      toast({ title: "Customer added successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error adding customer", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CRMCustomer> & { id: string }) => {
      const { data, error } = await supabase
        .from("crm_customers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-customers"] });
      toast({ title: "Customer updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating customer", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("crm_customers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-customers"] });
      toast({ title: "Customer deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting customer", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Orders
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ["crm-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_orders")
        .select(`
          *,
          crm_customers (
            name,
            whatsapp_number
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as CRMOrder[];
    },
  });

  const addOrder = useMutation({
    mutationFn: async (order: Omit<CRMOrder, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("crm_orders")
        .insert([order])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-orders"] });
      toast({ title: "Order added successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error adding order", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CRMOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from("crm_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-orders"] });
      toast({ title: "Order updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating order", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("crm_orders")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-orders"] });
      toast({ title: "Order deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting order", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Messages
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ["crm-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_messages")
        .select(`
          *,
          crm_customers (
            name,
            whatsapp_number
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as CRMMessage[];
    },
  });

  const getCustomerMessages = (customerId: string) => {
    return messages?.filter(m => m.customer_id === customerId) || [];
  };

  const markMessageAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("crm_messages")
        .update({ is_read: true })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-messages"] });
    },
  });

  // WhatsApp Providers
  const { data: providers, isLoading: loadingProviders } = useQuery({
    queryKey: ["crm-whatsapp-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_whatsapp_providers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as WhatsAppProvider[];
    },
  });

  const addProvider = useMutation({
    mutationFn: async (provider: Omit<WhatsAppProvider, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("crm_whatsapp_providers")
        .insert([provider])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-whatsapp-providers"] });
      toast({ title: "WhatsApp provider added successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error adding provider", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateProvider = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WhatsAppProvider> & { id: string }) => {
      const { data, error } = await supabase
        .from("crm_whatsapp_providers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-whatsapp-providers"] });
      toast({ title: "Provider updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating provider", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteProvider = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("crm_whatsapp_providers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-whatsapp-providers"] });
      toast({ title: "Provider deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting provider", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  return {
    customers,
    loadingCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    orders,
    loadingOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    messages,
    loadingMessages,
    getCustomerMessages,
    markMessageAsRead,
    providers,
    loadingProviders,
    addProvider,
    updateProvider,
    deleteProvider,
  };
};
