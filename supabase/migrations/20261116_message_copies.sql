-- Copies of the messages Jobyra sends - 2026-11-16
--
-- body_html on reminder_emails and automation_log: the email as it went out, so "Recent messages" can show it.
-- visit_messages: the emails about a booked visit (reminder, "on my way", "moved"), written from the app by a signed-in
--                 team member. Kept even if the visit is later deleted.
-- Copies are not needed forever: the daily job clears bodies older than 90 days (the rows themselves stay).

alter table public.reminder_emails add column if not exists body_html text;
alter table public.automation_log add column if not exists body_html text;

create table if not exists public.visit_messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  visit_id uuid references public.job_visits(id) on delete set null,
  kind text not null check (kind in ('reminder', 'on_the_way', 'moved')),
  to_email text not null check (char_length(to_email) <= 320),
  subject text not null check (char_length(subject) <= 300),
  body_html text check (body_html is null or char_length(body_html) <= 200000),
  sent_by uuid,
  sent_at timestamptz not null default now()
);

create index if not exists visit_messages_business_sent_idx on public.visit_messages (business_id, sent_at desc);
create index if not exists visit_messages_visit_idx on public.visit_messages (visit_id);

alter table public.visit_messages enable row level security;

drop policy if exists "business members read visit messages" on public.visit_messages;
create policy "business members read visit messages" on public.visit_messages for select to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));

drop policy if exists "business members add visit messages" on public.visit_messages;
create policy "business members add visit messages" on public.visit_messages for insert to authenticated
  with check (
    business_id = (select u.business_id from public.users u where u.id = (select auth.uid()))
    and exists (select 1 from public.job_visits v where v.id = visit_id and v.business_id = visit_messages.business_id)
  );
