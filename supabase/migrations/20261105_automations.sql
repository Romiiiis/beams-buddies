-- Automated customer emails - 2026-11-05
--
-- automation_settings: which automations a business has switched on (read and written by the business).
-- automation_log: one row per automated email. The unique key stops the same message going out twice
-- for the same job / invoice / quote. Written only by the scheduled sender (service role); the business can read it.

create table if not exists public.automation_settings (
  business_id uuid not null references public.businesses(id) on delete cascade,
  kind text not null check (kind in ('service', 'overdue', 'quote', 'review')),
  enabled boolean not null default false,
  days integer check (days between 1 and 90),
  updated_at timestamptz not null default now(),
  primary key (business_id, kind)
);

alter table public.automation_settings enable row level security;

drop policy if exists "business members read automation settings" on public.automation_settings;
create policy "business members read automation settings" on public.automation_settings for select to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));

drop policy if exists "business members add automation settings" on public.automation_settings;
create policy "business members add automation settings" on public.automation_settings for insert to authenticated
  with check (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));

drop policy if exists "business members change automation settings" on public.automation_settings;
create policy "business members change automation settings" on public.automation_settings for update to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));

create table if not exists public.automation_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  kind text not null check (kind in ('service', 'overdue', 'quote', 'review')),
  ref_id uuid not null,
  cycle text not null default '',
  to_email text not null,
  subject text not null,
  provider_id text,
  sent_at timestamptz not null default now(),
  unique (kind, ref_id, cycle)
);

create index if not exists automation_log_business_sent_idx on public.automation_log(business_id, sent_at desc);

alter table public.automation_log enable row level security;

drop policy if exists "business members read automation log" on public.automation_log;
create policy "business members read automation log" on public.automation_log for select to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));
-- No insert/update/delete policies: only the scheduled sender (service role) writes here.
