export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          employee_id: string
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          employee_id: string
          id?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crm_activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          customer_id: string
          description: string
          id: string
          metadata: Json | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          customer_id: string
          description: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          customer_id?: string
          description?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activity_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_conversation_metadata: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_id: string | null
          id: string
          is_archived: boolean | null
          is_starred: boolean | null
          last_message_at: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_starred?: boolean | null
          last_message_at?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_starred?: boolean | null
          last_message_at?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_conversation_metadata_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_customer_tag_assignments: {
        Row: {
          created_at: string
          customer_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_customer_tag_assignments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_customer_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_customer_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crm_customers: {
        Row: {
          address: string | null
          created_at: string
          customer_id: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_id: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_id?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      crm_leads: {
        Row: {
          created_at: string
          customer_id: string | null
          expected_close_date: string | null
          id: string
          notes: string | null
          probability: number | null
          stage: string
          title: string
          updated_at: string
          user_id: string | null
          value: number | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          probability?: number | null
          stage?: string
          title: string
          updated_at?: string
          user_id?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          probability?: number | null
          stage?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      crm_messages: {
        Row: {
          content: string
          created_at: string
          customer_id: string
          direction: Database["public"]["Enums"]["crm_message_direction"]
          id: string
          is_read: boolean
          message_id: string
          provider_name: string | null
          status: Database["public"]["Enums"]["crm_message_status"]
          user_id: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          customer_id: string
          direction: Database["public"]["Enums"]["crm_message_direction"]
          id?: string
          is_read?: boolean
          message_id: string
          provider_name?: string | null
          status?: Database["public"]["Enums"]["crm_message_status"]
          user_id?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          customer_id?: string
          direction?: Database["public"]["Enums"]["crm_message_direction"]
          id?: string
          is_read?: boolean
          message_id?: string
          provider_name?: string | null
          status?: Database["public"]["Enums"]["crm_message_status"]
          user_id?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_orders: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          items: Json | null
          notes: string | null
          order_date: string
          order_id: string
          status: Database["public"]["Enums"]["crm_order_status"]
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          items?: Json | null
          notes?: string | null
          order_date?: string
          order_id: string
          status?: Database["public"]["Enums"]["crm_order_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          items?: Json | null
          notes?: string | null
          order_date?: string
          order_id?: string
          status?: Database["public"]["Enums"]["crm_order_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_quick_replies: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_shared: boolean | null
          shortcut: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_shared?: boolean | null
          shortcut: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_shared?: boolean | null
          shortcut?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crm_whatsapp_providers: {
        Row: {
          api_key: string
          api_secret: string | null
          config: Json | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone_number: string | null
          provider_type: string
          updated_at: string
          user_id: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key: string
          api_secret?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone_number?: string | null
          provider_type: string
          updated_at?: string
          user_id?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string
          api_secret?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone_number?: string | null
          provider_type?: string
          updated_at?: string
          user_id?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          assigned_price_list_id: string | null
          created_at: string
          credit_limit: number | null
          customer_id: string
          email: string | null
          id: string
          name: string
          payment_terms: string | null
          phone: string | null
          store_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          assigned_price_list_id?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_id: string
          email?: string | null
          id?: string
          name: string
          payment_terms?: string | null
          phone?: string | null
          store_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          assigned_price_list_id?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_id?: string
          email?: string | null
          id?: string
          name?: string
          payment_terms?: string | null
          phone?: string | null
          store_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_price_list_id_fkey"
            columns: ["assigned_price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          department: string
          email: string | null
          employee_id: string
          hire_date: string
          id: string
          name: string
          phone: string | null
          position: string
          salary: number
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department: string
          email?: string | null
          employee_id: string
          hire_date?: string
          id?: string
          name: string
          phone?: string | null
          position: string
          salary?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department?: string
          email?: string | null
          employee_id?: string
          hire_date?: string
          id?: string
          name?: string
          phone?: string | null
          position?: string
          salary?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          category_id: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          features: string | null
          id: string
          item_id: string
          min_stock_level: number | null
          name: string
          price: number
          status: string
          stock: number
          supplier_id: string | null
          tax_rate: number | null
          unit: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          features?: string | null
          id?: string
          item_id: string
          min_stock_level?: number | null
          name: string
          price: number
          status?: string
          stock?: number
          supplier_id?: string | null
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          features?: string | null
          id?: string
          item_id?: string
          min_stock_level?: number | null
          name?: string
          price?: number
          status?: string
          stock?: number
          supplier_id?: string | null
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      price_lists: {
        Row: {
          created_at: string
          discount_percent: number | null
          fixed_price: number | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          product_id: string | null
          store_id: string | null
          type: string
          updated_at: string
          user_id: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          fixed_price?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          product_id?: string | null
          store_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          fixed_price?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          product_id?: string | null
          store_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_lists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_lists_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          project_id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          project_id: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          project_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          created_at: string
          date: string
          id: string
          order_id: string
          status: string
          supplier_id: string | null
          supplier_name: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          order_id: string
          status?: string
          supplier_id?: string | null
          supplier_name: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          order_id?: string
          status?: string
          supplier_id?: string | null
          supplier_name?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_invoices: {
        Row: {
          billing_address: string | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          date: string
          discount_amount: number | null
          id: string
          invoice_id: string
          invoice_type: string | null
          items: Json | null
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          shipping_address: string | null
          status: string
          subtotal: number | null
          tax_amount: number | null
          total_amount: number
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          date?: string
          discount_amount?: number | null
          id?: string
          invoice_id: string
          invoice_type?: string | null
          items?: Json | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: string | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          date?: string
          discount_amount?: number | null
          id?: string
          invoice_id?: string
          invoice_type?: string | null
          items?: Json | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: string | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          compact_view: boolean
          company_address: string
          company_email: string
          company_name: string
          company_phone: string
          created_at: string
          dark_mode: boolean
          email_notifications: boolean
          employee_updates: boolean
          id: string
          inventory_alerts: boolean
          sales_alerts: boolean
          updated_at: string
        }
        Insert: {
          compact_view?: boolean
          company_address?: string
          company_email?: string
          company_name?: string
          company_phone?: string
          created_at?: string
          dark_mode?: boolean
          email_notifications?: boolean
          employee_updates?: boolean
          id?: string
          inventory_alerts?: boolean
          sales_alerts?: boolean
          updated_at?: string
        }
        Update: {
          compact_view?: boolean
          company_address?: string
          company_email?: string
          company_name?: string
          company_phone?: string
          created_at?: string
          dark_mode?: boolean
          email_notifications?: boolean
          employee_updates?: boolean
          id?: string
          inventory_alerts?: boolean
          sales_alerts?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          supplier_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          supplier_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          supplier_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string
          status: string
          task_id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id: string
          status?: string
          task_id: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string
          status?: string
          task_id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          transaction_id: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          transaction_id: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          transaction_id?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_crm_activity: {
        Args: {
          p_activity_type: string
          p_customer_id: string
          p_description: string
          p_metadata?: Json
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      crm_message_direction: "incoming" | "outgoing"
      crm_message_status: "sent" | "delivered" | "read" | "failed"
      crm_order_status: "pending" | "in_progress" | "delivered" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      crm_message_direction: ["incoming", "outgoing"],
      crm_message_status: ["sent", "delivered", "read", "failed"],
      crm_order_status: ["pending", "in_progress", "delivered", "cancelled"],
    },
  },
} as const
