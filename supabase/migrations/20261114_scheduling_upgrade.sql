-- Scheduling upgrade - 2026-11-14
--
-- visit_series:     the repeat rule behind a run of visits. The visits are ordinary job_visits rows that point at it.
-- staff_members:    working days and hours for each technician (used to suggest free times).
-- staff_time_off:   days a technician is away.
-- to_book:          work that needs a time but does not have one yet ("to be booked").
-- visit_reminders:  every reminder emailed about a booked visit, by hand or automatically.
-- businesses.timezone: so automatic emails can say "9:00am" in the business's own time.

-- 1. Repeating visits ----------------------------------------------------------------------------

create table if not exists public.visit_series (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  rule jsonb not null,
  template jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.visit_series enable row level security;

drop policy if exists "business members manage visit series" on public.visit_series;
create policy "business members manage visit series" on public.visit_series for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));

alter table public.job_visits add column if not exists series_id uuid references public.visit_series(id) on delete set null;
create index if not exists job_visits_series_idx on public.job_visits(series_id, start_at);

-- A visit must be for the user's own business, and anything it points at must be too (now including its series).
drop policy if exists "business members manage visits" on public.job_visits;
create policy "business members manage visits" on public.job_visits for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (
    business_id = (select u.business_id from public.users u where u.id = (select auth.uid()))
    and (job_id is null or exists (select 1 from public.jobs j where j.id = job_id and j.business_id = job_visits.business_id))
    and (customer_id is null or exists (select 1 from public.customers c where c.id = customer_id and c.business_id = job_visits.business_id))
    and (staff_id is null or exists (select 1 from public.staff_members s where s.id = staff_id and s.business_id = job_visits.business_id))
    and (series_id is null or exists (select 1 from public.visit_series v where v.id = series_id and v.business_id = job_visits.business_id))
  );

-- Changes the visits after this one in its series (not completed or cancelled ones). Runs as the caller, so the normal
-- business rules apply. The time of day is set in the caller's own time zone so daylight saving does not shift it.
create or replace function public.series_update_following(
  p_visit uuid,
  p_title text,
  p_kind text,
  p_staff uuid,
  p_notes text,
  p_duration integer,
  p_time time,
  p_tz text
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_series uuid;
  v_start timestamptz;
  n integer;
begin
  select series_id, start_at into v_series, v_start from public.job_visits where id = p_visit;
  if v_series is null then
    return 0;
  end if;
  if p_tz is null or not exists (select 1 from pg_catalog.pg_timezone_names where name = p_tz) then
    raise exception 'unknown time zone';
  end if;
  if p_duration is null or p_duration < 15 or p_duration > 720 then
    raise exception 'bad length';
  end if;

  update public.job_visits j
     set title = p_title,
         kind = p_kind,
         staff_id = p_staff,
         notes = p_notes,
         start_at = ((j.start_at at time zone p_tz)::date + p_time) at time zone p_tz,
         end_at = (((j.start_at at time zone p_tz)::date + p_time) at time zone p_tz) + make_interval(mins => p_duration)
   where j.series_id = v_series
     and j.start_at > v_start
     and j.status = 'scheduled';
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.series_update_following(uuid, text, text, uuid, text, integer, time, text) from public, anon;
grant execute on function public.series_update_following(uuid, text, text, uuid, text, integer, time, text) to authenticated;

-- 2. Working days, hours and time off ----------------------------------------------------------------

alter table public.staff_members
  add column if not exists work_days smallint[] not null default '{1,2,3,4,5}',
  add column if not exists work_start time not null default '07:00',
  add column if not exists work_end time not null default '16:00';

alter table public.staff_members drop constraint if exists staff_members_work_days_check;
alter table public.staff_members add constraint staff_members_work_days_check
  check (work_days <@ array[0,1,2,3,4,5,6]::smallint[] and cardinality(work_days) <= 7);
alter table public.staff_members drop constraint if exists staff_members_work_hours_check;
alter table public.staff_members add constraint staff_members_work_hours_check check (work_end > work_start);

create table if not exists public.staff_time_off (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  staff_id uuid not null references public.staff_members(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  note text check (note is null or char_length(note) <= 200),
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists staff_time_off_staff_idx on public.staff_time_off(staff_id, start_date);

alter table public.staff_time_off enable row level security;

drop policy if exists "business members manage time off" on public.staff_time_off;
create policy "business members manage time off" on public.staff_time_off for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (
    business_id = (select u.business_id from public.users u where u.id = (select auth.uid()))
    and exists (select 1 from public.staff_members s where s.id = staff_id and s.business_id = staff_time_off.business_id)
  );

-- 3. To be booked ----------------------------------------------------------------------------------

create table if not exists public.to_book (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  staff_id uuid references public.staff_members(id) on delete set null,
  title text not null default 'Visit' check (char_length(btrim(title)) between 1 and 120),
  kind text not null default 'service' check (kind in ('service', 'install', 'repair', 'quote', 'other')),
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 720),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists to_book_business_idx on public.to_book(business_id, created_at);

alter table public.to_book enable row level security;

drop policy if exists "business members manage to be booked" on public.to_book;
create policy "business members manage to be booked" on public.to_book for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (
    business_id = (select u.business_id from public.users u where u.id = (select auth.uid()))
    and (customer_id is null or exists (select 1 from public.customers c where c.id = customer_id and c.business_id = to_book.business_id))
    and (job_id is null or exists (select 1 from public.jobs j where j.id = job_id and j.business_id = to_book.business_id))
    and (staff_id is null or exists (select 1 from public.staff_members s where s.id = staff_id and s.business_id = to_book.business_id))
  );

-- 4. Reminders before a visit --------------------------------------------------------------------------

alter table public.businesses add column if not exists timezone text not null default 'Australia/Sydney';

create table if not exists public.visit_reminders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  visit_id uuid not null references public.job_visits(id) on delete cascade,
  for_start timestamptz not null,
  to_email text not null,
  source text not null default 'manual' check (source in ('manual', 'auto')),
  sent_by uuid default auth.uid(),
  sent_at timestamptz not null default now()
);

create index if not exists visit_reminders_visit_idx on public.visit_reminders(visit_id, for_start);

alter table public.visit_reminders enable row level security;

drop policy if exists "business members read visit reminders" on public.visit_reminders;
create policy "business members read visit reminders" on public.visit_reminders for select to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));

drop policy if exists "business members add visit reminders" on public.visit_reminders;
create policy "business members add visit reminders" on public.visit_reminders for insert to authenticated
  with check (
    business_id = (select u.business_id from public.users u where u.id = (select auth.uid()))
    and exists (select 1 from public.job_visits v where v.id = visit_id and v.business_id = visit_reminders.business_id)
  );

-- The visit reminder is one more automatic email, switched on and off from Marketing like the others.
alter table public.automation_settings drop constraint if exists automation_settings_kind_check;
alter table public.automation_settings add constraint automation_settings_kind_check
  check (kind = any (array['service', 'overdue', 'quote', 'review', 'visit']));
alter table public.automation_log drop constraint if exists automation_log_kind_check;
alter table public.automation_log add constraint automation_log_kind_check
  check (kind = any (array['service', 'overdue', 'quote', 'review', 'visit']));
