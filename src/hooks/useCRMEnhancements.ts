import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string | null;
  variables: any;
  created_at: string;
  updated_at: string;
}

export interface CustomerTag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface QuickReply {
  id: string;
  shortcut: string;
  content: string;
  category: string | null;
  is_shared: boolean;
  created_at: string;
}

export interface ConversationMetadata {
  id: string;
  customer_id: string;
  is_starred: boolean;
  is_archived: boolean;
  assigned_to: string | null;
  last_message_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useCRMEnhancements = () => {
  const queryClient = useQueryClient();

  // Message Templates
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["crm-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_message_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MessageTemplate[];
    },
  });

  const addTemplate = useMutation({
    mutationFn: async (template: Omit<MessageTemplate, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("crm_message_templates")
        .insert(template)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-templates"] });
      toast.success("Template added successfully");
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_message_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-templates"] });
      toast.success("Template deleted");
    },
  });

  // Customer Tags
  const { data: tags = [], isLoading: loadingTags } = useQuery({
    queryKey: ["crm-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_customer_tags")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as CustomerTag[];
    },
  });

  const addTag = useMutation({
    mutationFn: async (tag: Omit<CustomerTag, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("crm_customer_tags")
        .insert(tag)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tags"] });
      toast.success("Tag added successfully");
    },
  });

  // Quick Replies
  const { data: quickReplies = [], isLoading: loadingQuickReplies } = useQuery({
    queryKey: ["crm-quick-replies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_quick_replies")
        .select("*")
        .order("shortcut");
      if (error) throw error;
      return data as QuickReply[];
    },
  });

  const addQuickReply = useMutation({
    mutationFn: async (reply: Omit<QuickReply, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("crm_quick_replies")
        .insert(reply)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-quick-replies"] });
      toast.success("Quick reply added successfully");
    },
  });

  const deleteQuickReply = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_quick_replies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-quick-replies"] });
      toast.success("Quick reply deleted");
    },
  });

  // Conversation Metadata
  const getConversationMetadata = async (customerId: string) => {
    const { data, error } = await supabase
      .from("crm_conversation_metadata")
      .select("*")
      .eq("customer_id", customerId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) {
      const { data: newData, error: insertError } = await supabase
        .from("crm_conversation_metadata")
        .insert({ customer_id: customerId })
        .select()
        .single();
      if (insertError) throw insertError;
      return newData as ConversationMetadata;
    }
    
    return data as ConversationMetadata;
  };

  const updateConversationMetadata = useMutation({
    mutationFn: async ({ customerId, updates }: { customerId: string; updates: Partial<ConversationMetadata> }) => {
      const { data, error } = await supabase
        .from("crm_conversation_metadata")
        .upsert({ customer_id: customerId, ...updates })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-conversation-metadata"] });
    },
  });

  return {
    templates,
    loadingTemplates,
    addTemplate,
    deleteTemplate,
    tags,
    loadingTags,
    addTag,
    quickReplies,
    loadingQuickReplies,
    addQuickReply,
    deleteQuickReply,
    getConversationMetadata,
    updateConversationMetadata,
  };
};
