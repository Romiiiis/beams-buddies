-- Field work and money - 2026-11-15
--
-- checklist_templates: reusable checklists a business writes once (service steps, install sign-off...).
-- visit_checklists:    a checklist ticked off on a visit, with notes and the customer's sign-off.
-- expenses:            money spent, optionally on a job, so a job's profit can be worked out.
-- staff_members.hourly_cost: what an hour of a technician's time costs the business (private; used for job costing).

create table if not exists public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 60),
  requires_signature boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists checklist_templates_business_idx on public.checklist_templates(business_id, name);

alter table public.checklist_templates enable row level security;

drop policy if exists "business members manage checklist templates" on public.checklist_templates;
create policy "business members manage checklist templates" on public.checklist_templates for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));

create table if not exists public.visit_checklists (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  visit_id uuid not null references public.job_visits(id) on delete cascade,
  template_id uuid references public.checklist_templates(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 60),
  notes text check (notes is null or char_length(notes) <= 2000),
  requires_signature boolean not null default false,
  signed_name text check (signed_name is null or char_length(signed_name) <= 120),
  signed_at timestamptz,
  signature text check (signature is null or char_length(signature) <= 100000),
  created_at timestamptz not null default now()
);

create index if not exists visit_checklists_visit_idx on public.visit_checklists(visit_id, created_at);

alter table public.visit_checklists enable row level security;

drop policy if exists "business members manage visit checklists" on public.visit_checklists;
create policy "business members manage visit checklists" on public.visit_checklists for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (
    business_id = (select u.business_id from public.users u where u.id = (select auth.uid()))
    and exists (select 1 from public.job_visits v where v.id = visit_id and v.business_id = visit_checklists.business_id)
    and (template_id is null or exists (select 1 from public.checklist_templates t where t.id = template_id and t.business_id = visit_checklists.business_id))
  );

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  spent_on date not null default current_date,
  description text not null check (char_length(btrim(description)) between 1 and 200),
  supplier text check (supplier is null or char_length(supplier) <= 120),
  category text not null default 'materials' check (category in ('materials', 'equipment', 'subcontractor', 'fuel', 'tools', 'vehicle', 'other')),
  amount numeric(12,2) not null check (amount >= 0),
  gst numeric(12,2) check (gst is null or (gst >= 0 and gst <= amount)),
  job_id uuid references public.jobs(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists expenses_business_date_idx on public.expenses(business_id, spent_on desc);
create index if not exists expenses_job_idx on public.expenses(job_id);

alter table public.expenses enable row level security;

drop policy if exists "business members manage expenses" on public.expenses;
create policy "business members manage expenses" on public.expenses for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (
    business_id = (select u.business_id from public.users u where u.id = (select auth.uid()))
    and (job_id is null or exists (select 1 from public.jobs j where j.id = job_id and j.business_id = expenses.business_id))
  );

alter table public.staff_members add column if not exists hourly_cost numeric(8,2);
alter table public.staff_members drop constraint if exists staff_members_hourly_cost_check;
alter table public.staff_members add constraint staff_members_hourly_cost_check check (hourly_cost is null or hourly_cost >= 0);
