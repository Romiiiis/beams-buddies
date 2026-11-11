-- Several properties per customer - 2026-11-17
--
-- customer_sites: extra addresses a customer owns or manages (rentals, a second home, a shop). The customer's own
--                 address stays on the customer record as the main property.
-- jobs.site_id and job_visits.site_id: which property a unit or a visit is at. Empty means the main address.
-- A property can only be used by its own customer's jobs and visits, in the same business.
-- The technician's phone-calendar feed uses the property's address when a visit has one.

create table if not exists public.customer_sites (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 1 and 80),
  address text not null check (char_length(btrim(address)) between 1 and 200),
  suburb text check (suburb is null or char_length(suburb) <= 80),
  state text check (state is null or char_length(state) <= 40),
  postcode text check (postcode is null or char_length(postcode) <= 12),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists customer_sites_customer_idx on public.customer_sites (customer_id, created_at);
create index if not exists customer_sites_business_idx on public.customer_sites (business_id);

alter table public.customer_sites enable row level security;

drop policy if exists "business members manage properties" on public.customer_sites;
create policy "business members manage properties" on public.customer_sites for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (
    business_id = (select u.business_id from public.users u where u.id = (select auth.uid()))
    and exists (select 1 from public.customers c where c.id = customer_id and c.business_id = customer_sites.business_id)
  );

alter table public.jobs add column if not exists site_id uuid references public.customer_sites(id) on delete set null;
alter table public.job_visits add column if not exists site_id uuid references public.customer_sites(id) on delete set null;

create index if not exists jobs_site_idx on public.jobs (site_id) where site_id is not null;
create index if not exists job_visits_site_idx on public.job_visits (site_id) where site_id is not null;

-- A property must belong to the same business, and to the same customer as the job or visit
create or replace function public.check_site_matches() returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.site_id is not null and not exists (
    select 1 from public.customer_sites s
    where s.id = new.site_id
      and s.business_id = new.business_id
      and (new.customer_id is null or s.customer_id = new.customer_id)
  ) then
    raise exception 'That property does not belong to this customer';
  end if;
  return new;
end;
$$;

drop trigger if exists jobs_site_check on public.jobs;
create trigger jobs_site_check before insert or update of site_id, customer_id on public.jobs
  for each row execute function public.check_site_matches();

drop trigger if exists job_visits_site_check on public.job_visits;
create trigger job_visits_site_check before insert or update of site_id, customer_id on public.job_visits
  for each row execute function public.check_site_matches();

-- Phone calendar feed: the property's address when the visit has one, with the property's name in the details
create or replace function public.staff_calendar_feed(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $function$
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
        'site', cs.label,
        'address', case
          when cs.id is not null then nullif(btrim(concat_ws(', ', nullif(cs.address, ''), nullif(cs.suburb, ''), nullif(cs.state, ''), nullif(cs.postcode, ''))), '')
          else nullif(btrim(concat_ws(', ', nullif(c.address, ''), nullif(c.suburb, ''), nullif(c.state, ''), nullif(c.postcode, ''))), '')
        end
      ) order by v.start_at)
      from public.job_visits v
      left join public.customers c on c.id = v.customer_id
      left join public.customer_sites cs on cs.id = v.site_id
      where v.staff_id = s.id
        and v.status <> 'cancelled'
        and v.start_at >= now() - interval '30 days'
        and v.start_at < now() + interval '365 days'
    ), '[]'::jsonb)
  )
  from public.staff_members s
  join public.businesses b on b.id = s.business_id
  where p_token is not null and s.calendar_token = p_token and s.active;
$function$;
