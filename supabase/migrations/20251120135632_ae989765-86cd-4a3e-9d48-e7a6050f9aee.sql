-- Add user_id columns to all tables
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.price_lists ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.crm_customers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.crm_messages ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.crm_orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.crm_customer_tags ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.crm_message_templates ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.crm_quick_replies ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.crm_whatsapp_providers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can view sales invoices" ON public.sales_invoices;
DROP POLICY IF EXISTS "Anyone can insert sales invoices" ON public.sales_invoices;
DROP POLICY IF EXISTS "Anyone can update sales invoices" ON public.sales_invoices;
DROP POLICY IF EXISTS "Anyone can delete sales invoices" ON public.sales_invoices;

DROP POLICY IF EXISTS "Anyone can view customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can update customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can delete customers" ON public.customers;

DROP POLICY IF EXISTS "Anyone can view inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Anyone can insert inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Anyone can update inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Anyone can delete inventory items" ON public.inventory_items;

DROP POLICY IF EXISTS "Anyone can view suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Anyone can insert suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Anyone can update suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Anyone can delete suppliers" ON public.suppliers;

DROP POLICY IF EXISTS "Anyone can view purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Anyone can insert purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Anyone can update purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Anyone can delete purchase orders" ON public.purchase_orders;

DROP POLICY IF EXISTS "Anyone can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can delete transactions" ON public.transactions;

DROP POLICY IF EXISTS "Anyone can view employees" ON public.employees;
DROP POLICY IF EXISTS "Anyone can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Anyone can update employees" ON public.employees;
DROP POLICY IF EXISTS "Anyone can delete employees" ON public.employees;

DROP POLICY IF EXISTS "Anyone can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Anyone can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Anyone can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Anyone can delete attendance" ON public.attendance;

DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can delete projects" ON public.projects;

DROP POLICY IF EXISTS "Anyone can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can delete tasks" ON public.tasks;

DROP POLICY IF EXISTS "Anyone can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can manage price lists" ON public.price_lists;
DROP POLICY IF EXISTS "Anyone can manage customers" ON public.crm_customers;
DROP POLICY IF EXISTS "Anyone can manage messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Anyone can manage orders" ON public.crm_orders;
DROP POLICY IF EXISTS "Anyone can manage leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Anyone can manage tags" ON public.crm_customer_tags;
DROP POLICY IF EXISTS "Anyone can manage templates" ON public.crm_message_templates;
DROP POLICY IF EXISTS "Anyone can manage quick replies" ON public.crm_quick_replies;
DROP POLICY IF EXISTS "Anyone can manage providers" ON public.crm_whatsapp_providers;

-- Create user-scoped RLS policies
CREATE POLICY "Users can view own sales invoices" ON public.sales_invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sales invoices" ON public.sales_invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sales invoices" ON public.sales_invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sales invoices" ON public.sales_invoices FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own inventory items" ON public.inventory_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory items" ON public.inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory items" ON public.inventory_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory items" ON public.inventory_items FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own suppliers" ON public.suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own suppliers" ON public.suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own suppliers" ON public.suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own suppliers" ON public.suppliers FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own purchase orders" ON public.purchase_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchase orders" ON public.purchase_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own purchase orders" ON public.purchase_orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own purchase orders" ON public.purchase_orders FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own employees" ON public.employees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own employees" ON public.employees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own employees" ON public.employees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own employees" ON public.employees FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attendance" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attendance" ON public.attendance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own attendance" ON public.attendance FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own categories" ON public.categories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own price lists" ON public.price_lists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own crm customers" ON public.crm_customers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own crm messages" ON public.crm_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own crm orders" ON public.crm_orders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own crm leads" ON public.crm_leads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own crm tags" ON public.crm_customer_tags FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own crm templates" ON public.crm_message_templates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own crm quick replies" ON public.crm_quick_replies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own crm providers" ON public.crm_whatsapp_providers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);