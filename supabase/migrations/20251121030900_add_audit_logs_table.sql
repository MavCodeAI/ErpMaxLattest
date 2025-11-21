-- Create audit_logs table to store security-relevant actions
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  timestamp timestamptz not null default timezone('utc', now())
);

-- Helpful index for querying logs by user and time
create index if not exists audit_logs_user_time_idx
  on public.audit_logs (user_id, timestamp desc);

-- Enable RLS and scope logs per user
alter table public.audit_logs enable row level security;

drop policy if exists "View own audit logs" on public.audit_logs;
drop policy if exists "Insert own audit logs" on public.audit_logs;

drop policy if exists "Admins can view all audit logs" on public.audit_logs;

drop policy if exists "Admins can insert audit logs" on public.audit_logs;

create policy "View own audit logs"
  on public.audit_logs for select
  using (auth.uid() = user_id);

create policy "Insert own audit logs"
  on public.audit_logs for insert
  with check (auth.uid() = user_id);

-- Optional policy hook for privileged roles. Adjust as needed if you add an admin concept.
create policy "Admins can view all audit logs"
  on public.audit_logs for select
  using (
    auth.role() = 'service_role'
  );

create policy "Admins can insert audit logs"
  on public.audit_logs for insert
  with check (
    auth.role() = 'service_role'
  );
