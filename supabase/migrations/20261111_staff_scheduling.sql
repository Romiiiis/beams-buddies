-- Staff scheduling - 2026-11-11
--
-- staff_members: the technicians a business schedules (they do not need their own login yet).
-- job_visits:    appointments on the calendar: who, where, when, and how it went.
-- staff_calendar_feed(token): read-only feed of one technician's visits, for a phone calendar subscription.
--                Anonymous callers can only use this function, never read the tables.

create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  email text check (email is null or char_length(email) <= 200),
  phone text check (phone is null or char_length(phone) <= 40),
  colour text not null default '#2AA198' check (colour ~ '^#[0-9A-Fa-f]{6}$'),
  active boolean not null default true,
  calendar_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create index if not exists staff_members_business_idx on public.staff_members(business_id);
create unique index if not exists staff_members_calendar_token_key on public.staff_members(calendar_token);

alter table public.staff_members enable row level security;

drop policy if exists "business members manage staff" on public.staff_members;
create policy "business members manage staff" on public.staff_members for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));

create table if not exists public.job_visits (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  staff_id uuid references public.staff_members(id) on delete set null,
  title text not null default 'Visit' check (char_length(btrim(title)) between 1 and 120),
  kind text not null default 'service' check (kind in ('service', 'install', 'repair', 'quote', 'other')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'on_the_way', 'in_progress', 'completed', 'cancelled')),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index if not exists job_visits_business_start_idx on public.job_visits(business_id, start_at);
create index if not exists job_visits_staff_start_idx on public.job_visits(staff_id, start_at);

alter table public.job_visits enable row level security;

-- A visit must be for the user's own business, and any job, customer or technician it points at must be too.
drop policy if exists "business members manage visits" on public.job_visits;
create policy "business members manage visits" on public.job_visits for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (
    business_id = (select u.business_id from public.users u where u.id = (select auth.uid()))
    and (job_id is null or exists (select 1 from public.jobs j where j.id = job_id and j.business_id = job_visits.business_id))
    and (customer_id is null or exists (select 1 from public.customers c where c.id = customer_id and c.business_id = job_visits.business_id))
    and (staff_id is null or exists (select 1 from public.staff_members s where s.id = staff_id and s.business_id = job_visits.business_id))
  );

create or replace function public.touch_job_visit()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists job_visits_touch on public.job_visits;
create trigger job_visits_touch before update on public.job_visits
  for each row execute function public.touch_job_visit();

-- Feed for one technician's phone calendar. The token is the secret; it can be replaced at any time.
create or replace function public.staff_calendar_feed(p_token uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'staff', jsonb_build_object('name', s.name),
    'business', jsonb_build_object('name', b.name, 'phone', b.phone),
    'visits', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', v.id,
        'title', v.title,
        'kind', v.kind,
        'status', v.status,
        'start_at', v.start_at,
        'end_at', v.end_at,
        'notes', v.notes,
        'customer_name', nullif(btrim(coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, '')), ''),
        'customer_phone', c.phone,
        'address', nullif(btrim(concat_ws(', ', nullif(c.address, ''), nullif(c.suburb, ''), nullif(c.state, ''), nullif(c.postcode, ''))), '')
      ) order by v.start_at)
      from public.job_visits v
      left join public.customers c on c.id = v.customer_id
      where v.staff_id = s.id
        and v.status <> 'cancelled'
        and v.start_at >= now() - interval '30 days'
        and v.start_at < now() + interval '365 days'
    ), '[]'::jsonb)
  )
  from public.staff_members s
  join public.businesses b on b.id = s.business_id
  where p_token is not null and s.calendar_token = p_token and s.active;
$$;

revoke all on function public.staff_calendar_feed(uuid) from public;
grant execute on function public.staff_calendar_feed(uuid) to anon, authenticated;
