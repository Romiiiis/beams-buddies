-- Service reminder emails sent by Jobyra (via Resend) - 2026-11-03
--
-- One row per reminder sent. Used to show "Reminder sent <date>" on the Schedule page and to
-- cap how many reminders a business can send per day. Rows are written by /api/reminders/send,
-- which runs as the signed-in user, so normal business-scoped security applies.

create table if not exists public.reminder_emails (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  to_email text not null,
  subject text not null,
  provider_id text,
  sent_by uuid references auth.users(id) on delete set null default auth.uid(),
  sent_at timestamptz not null default now()
);

create index if not exists reminder_emails_business_sent_idx on public.reminder_emails(business_id, sent_at desc);
create index if not exists reminder_emails_job_idx on public.reminder_emails(job_id, sent_at desc);

alter table public.reminder_emails enable row level security;

drop policy if exists "business members read reminders" on public.reminder_emails;
create policy "business members read reminders" on public.reminder_emails for select to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));

-- Inserts must be for the user's own business AND for a job that belongs to that business
drop policy if exists "business members log reminders" on public.reminder_emails;
create policy "business members log reminders" on public.reminder_emails for insert to authenticated
  with check (
    business_id = (select u.business_id from public.users u where u.id = (select auth.uid()))
    and exists (select 1 from public.jobs j where j.id = job_id and j.business_id = reminder_emails.business_id)
  );

-- Quick lookup for the Schedule page
alter table public.jobs add column if not exists last_reminder_at timestamptz;
