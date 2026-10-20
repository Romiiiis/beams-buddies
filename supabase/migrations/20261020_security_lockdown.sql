-- Security lockdown (2026-10-20)
--
-- Closes the holes found in the security review:
--   1. Anonymous visitors could read and edit every job, customer, business and
--      business_settings row (incl. bank details) through the QR-page policies.
--   2. A signed-in user could attach themselves to any business via the users table.
--   3. Leads had no business, so every business could see/edit every lead.
--   4. Any signed-in user could overwrite or delete any business's logo.
--   5. Review-click tracking was silently failing (no permission to insert).
--
-- Anonymous access now goes only through token-scoped functions that return or
-- change the single job behind a QR code, and nothing else.

begin;

-- ─── 1. QR registration: replace open anon policies with token-scoped functions ──

drop policy if exists anon_qr_job_select          on public.jobs;
drop policy if exists anon_qr_job_update          on public.jobs;
drop policy if exists anon_qr_customer_select     on public.customers;
drop policy if exists anon_qr_customer_update     on public.customers;
drop policy if exists anon_qr_business_select     on public.businesses;
drop policy if exists anon_qr_settings_select     on public.business_settings;
drop policy if exists anon_qr_registration_insert on public.app_registrations;

-- Returns only what the QR registration page displays, for the one matching job.
create or replace function public.get_job_by_qr_token(p_token text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', j.id,
    'business_id', j.business_id,
    'customer_id', j.customer_id,
    'equipment_type', j.equipment_type,
    'brand', j.brand,
    'capacity_kw', j.capacity_kw,
    'customers', jsonb_build_object('first_name', c.first_name, 'last_name', c.last_name, 'email', c.email, 'phone', c.phone),
    'businesses', jsonb_build_object('id', b.id, 'name', b.name, 'phone', b.phone, 'email', b.email, 'industry', b.industry),
    'settings', jsonb_build_object(
      'google_review_url', s.google_review_url,
      'facebook_review_url', s.facebook_review_url,
      'custom_review_platforms', coalesce(s.custom_review_platforms, '[]'::jsonb)
    )
  )
  from jobs j
  join customers c on c.id = j.customer_id
  join businesses b on b.id = j.business_id
  left join business_settings s on s.business_id = j.business_id
  where p_token is not null and length(p_token) >= 32 and j.qr_code_token = p_token;
$$;

-- Customer confirms their details from the QR page. Only touches that job's customer.
create or replace function public.register_job_by_qr_token(
  p_token text, p_first_name text, p_last_name text, p_email text, p_phone text, p_device_type text
) returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_job jobs%rowtype;
begin
  select * into v_job from jobs where p_token is not null and length(p_token) >= 32 and qr_code_token = p_token;
  if not found then
    return false;
  end if;

  update customers
  set first_name = coalesce(nullif(trim(left(p_first_name, 100)), ''), first_name),
      last_name  = coalesce(nullif(trim(left(p_last_name, 100)), ''), last_name),
      email      = coalesce(nullif(trim(left(p_email, 200)), ''), email),
      phone      = coalesce(nullif(trim(left(p_phone, 50)), ''), phone)
  where id = v_job.customer_id;

  insert into app_registrations (job_id, customer_id, device_type)
  values (v_job.id, v_job.customer_id,
          case when p_device_type in ('ios', 'android', 'web') then p_device_type else 'web' end);

  return true;
end;
$$;

-- Customer tapped a review link on the QR page.
create or replace function public.mark_review_clicked_by_qr_token(p_token text, p_platform text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_job jobs%rowtype;
begin
  select * into v_job from jobs where p_token is not null and length(p_token) >= 32 and qr_code_token = p_token;
  if not found then
    return;
  end if;

  update jobs set review_link_clicked = true where id = v_job.id;

  if p_platform is not null and length(trim(p_platform)) > 0 then
    insert into review_clicks (job_id, customer_id, business_id, platform)
    values (v_job.id, v_job.customer_id, v_job.business_id, left(trim(p_platform), 50));
  end if;
end;
$$;

-- Review link opened from a reminder (/track-review). Business and customer are taken
-- from the job itself, never from the link, so a link can't write into another business.
create or replace function public.record_review_click(p_job_id uuid, p_platform text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_job jobs%rowtype;
begin
  select * into v_job from jobs where id = p_job_id;
  if not found or p_platform is null or length(trim(p_platform)) = 0 then
    return;
  end if;

  update jobs set review_link_clicked = true where id = v_job.id;
  insert into review_clicks (job_id, customer_id, business_id, platform)
  values (v_job.id, v_job.customer_id, v_job.business_id, left(trim(p_platform), 50));
end;
$$;

revoke execute on function public.get_job_by_qr_token(text) from public;
revoke execute on function public.register_job_by_qr_token(text, text, text, text, text, text) from public;
revoke execute on function public.mark_review_clicked_by_qr_token(text, text) from public;
revoke execute on function public.record_review_click(uuid, text) from public;
grant execute on function public.get_job_by_qr_token(text) to anon, authenticated;
grant execute on function public.register_job_by_qr_token(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.mark_review_clicked_by_qr_token(text, text) to anon, authenticated;
grant execute on function public.record_review_click(uuid, text) to anon, authenticated;

-- ─── 2. Account setup: no more choosing your own business ─────────────────────

-- First sign-in creates a fresh business + users row server-side. A user can never
-- attach themselves to an existing business.
create or replace function public.bootstrap_my_business()
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_business_id uuid;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;

  select business_id into v_business_id from users where id = v_uid;
  if v_business_id is not null then
    return v_business_id;
  end if;

  select email into v_email from auth.users where id = v_uid;

  -- Business emails are unique. Never attach to an existing business on a match;
  -- use a placeholder the owner replaces in Settings instead.
  if v_email is null or exists (select 1 from businesses where email = v_email) then
    v_email := v_uid::text || '@pending.jobyra.app';
  end if;

  insert into businesses (name, email, industry)
  values ('', v_email, 'hvac')
  returning id into v_business_id;

  insert into users (id, business_id, email, full_name, role_title, role)
  values (v_uid, v_business_id, coalesce((select email from auth.users where id = v_uid), ''), '', '', 'owner');

  return v_business_id;
end;
$$;

revoke execute on function public.bootstrap_my_business() from public, anon;
grant execute on function public.bootstrap_my_business() to authenticated;

-- Businesses and users rows are now only created by bootstrap_my_business().
drop policy if exists "insert business" on public.businesses;
drop policy if exists "insert user"     on public.users;

-- Users may still edit their own name/title, but never move to another business.
create or replace function public.prevent_business_change()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.business_id is distinct from old.business_id then
    raise exception 'business_id cannot be changed';
  end if;
  if new.id is distinct from old.id then
    raise exception 'id cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists users_prevent_business_change on public.users;
create trigger users_prevent_business_change
  before update on public.users
  for each row execute function public.prevent_business_change();

drop policy if exists "update user" on public.users;
create policy "update user" on public.users for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "update business" on public.businesses;
create policy "update business" on public.businesses for update to authenticated
  using (id in (select u.business_id from users u where u.id = (select auth.uid())))
  with check (id in (select u.business_id from users u where u.id = (select auth.uid())));

-- ─── 3. Leads belong to a business ────────────────────────────────────────────

alter table public.leads add column if not exists business_id uuid references public.businesses(id) on delete cascade;

-- Fill business_id from the signed-in user when the app doesn't send one.
create or replace function public.set_lead_business()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.business_id is null then
    select business_id into new.business_id from users where id = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists leads_set_business on public.leads;
create trigger leads_set_business
  before insert on public.leads
  for each row execute function public.set_lead_business();

-- The table is empty today, so the column can be required straight away.
alter table public.leads alter column business_id set not null;
create index if not exists leads_business_id_idx on public.leads(business_id);

drop policy if exists "anon can submit leads"          on public.leads;
drop policy if exists "authenticated can manage leads" on public.leads;
create policy "business members only" on public.leads for all to authenticated
  using (business_id = (select u.business_id from users u where u.id = (select auth.uid())))
  with check (business_id = (select u.business_id from users u where u.id = (select auth.uid())));

-- ─── 4. Logos: each business can only change files in its own folder ──────────

drop policy if exists "Allow authenticated uploads to business logos"   on storage.objects;
drop policy if exists "Allow authenticated updates to business logos"   on storage.objects;
drop policy if exists "Allow authenticated deletes from business logos" on storage.objects;

create policy "business logos insert own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = (select u.business_id::text from public.users u where u.id = (select auth.uid())));

create policy "business logos update own folder" on storage.objects for update to authenticated
  using (bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = (select u.business_id::text from public.users u where u.id = (select auth.uid())))
  with check (bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = (select u.business_id::text from public.users u where u.id = (select auth.uid())));

create policy "business logos delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = (select u.business_id::text from public.users u where u.id = (select auth.uid())));

-- ─── 5. Customers policy: make the write check explicit ───────────────────────

drop policy if exists "business members only" on public.customers;
create policy "business members only" on public.customers for all to authenticated
  using (business_id = (select u.business_id from users u where u.id = (select auth.uid())))
  with check (business_id = (select u.business_id from users u where u.id = (select auth.uid())));

commit;

-- Follow-up (applied separately as revoke_trigger_helper_execute): trigger helpers
-- are only meant to run from their triggers, never be called directly.
revoke execute on function public.set_lead_business() from public, anon, authenticated;
revoke execute on function public.prevent_business_change() from public, anon, authenticated;
