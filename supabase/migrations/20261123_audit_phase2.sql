-- Audit phase 2 - 2026-11-16
--
-- 1. sent_emails: a record of emails sent by hand (invoices, custom messages), so each business has a daily cap
--    and Jobyra's sending address cannot be used to send mail in bulk.
-- 2. customers.email_opt_out: a customer can unsubscribe from reminder and follow-up emails, and stays unsubscribed.
-- 3. QR page: the lookup behind a QR code no longer hands out the customer's email, phone and last name.
--    It returns the first name and a masked hint ("j***@g***") so the right person still recognises their details.
-- 4. Review links: the click recorder returns the business's own saved review links, so the redirect page can only
--    ever send a visitor to one of those. Clicks are capped per job per day.
-- 5. Logo uploads: images only, 10 MB at most.

-- 1. Emails sent by hand ------------------------------------------------------------------------

create table if not exists public.sent_emails (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  kind text not null check (kind in ('invoice', 'contact')),
  ref_id uuid,
  to_email text not null check (char_length(to_email) <= 320),
  subject text not null default '' check (char_length(subject) <= 300),
  sent_by uuid default auth.uid(),
  sent_at timestamptz not null default now()
);

create index if not exists sent_emails_business_sent_idx on public.sent_emails (business_id, sent_at desc);

alter table public.sent_emails enable row level security;

-- Read and add only. There is deliberately no way to change or delete a row from the app, so the daily count holds.
drop policy if exists "business members read sent emails" on public.sent_emails;
create policy "business members read sent emails" on public.sent_emails for select to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));

drop policy if exists "business members log sent emails" on public.sent_emails;
create policy "business members log sent emails" on public.sent_emails for insert to authenticated
  with check (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));

-- 2. Unsubscribe --------------------------------------------------------------------------------

alter table public.customers add column if not exists email_opt_out boolean not null default false;
alter table public.customers add column if not exists email_opt_out_at timestamptz;

-- 3. QR page ------------------------------------------------------------------------------------

create or replace function public.get_job_by_qr_token(p_token text)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select jsonb_build_object(
    'id', j.id,
    'business_id', j.business_id,
    'equipment_type', j.equipment_type,
    'brand', j.brand,
    'capacity_kw', j.capacity_kw,
    'customers', jsonb_build_object(
      'first_name', c.first_name,
      'email_hint', case
        when position('@' in coalesce(c.email, '')) < 2 then null
        else left(btrim(c.email), 1) || '***@' || left(split_part(btrim(c.email), '@', 2), 1) || '***'
      end,
      'phone_hint', case
        when length(regexp_replace(coalesce(c.phone, ''), '\D', '', 'g')) < 6 then null
        else '*** ' || right(regexp_replace(c.phone, '\D', '', 'g'), 3)
      end
    ),
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

-- 4. Review links -------------------------------------------------------------------------------

-- The return type changes (nothing -> the list of saved review links), so the old one is replaced.
drop function if exists public.record_review_click(uuid, text);

create function public.record_review_click(p_job_id uuid, p_platform text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_job jobs%rowtype;
  v_recent integer;
  v_links jsonb;
begin
  select * into v_job from jobs where id = p_job_id;
  if not found then
    return '[]'::jsonb;
  end if;

  if p_platform is not null and length(trim(p_platform)) > 0 then
    select count(*) into v_recent from review_clicks where job_id = v_job.id and clicked_at > now() - interval '1 day';
    if v_recent < 30 then
      update jobs set review_link_clicked = true where id = v_job.id;
      insert into review_clicks (job_id, customer_id, business_id, platform)
      values (v_job.id, v_job.customer_id, v_job.business_id, left(trim(p_platform), 50));
    end if;
  end if;

  select coalesce(jsonb_agg(t.u), '[]'::jsonb) into v_links
  from (
    select s.google_review_url as u from business_settings s
      where s.business_id = v_job.business_id and coalesce(s.google_review_url, '') <> ''
    union all
    select s.facebook_review_url from business_settings s
      where s.business_id = v_job.business_id and coalesce(s.facebook_review_url, '') <> ''
    union all
    select p.item->>'url' from business_settings s
      cross join lateral jsonb_array_elements(
        case when jsonb_typeof(s.custom_review_platforms) = 'array' then s.custom_review_platforms else '[]'::jsonb end
      ) as p(item)
      where s.business_id = v_job.business_id and coalesce(p.item->>'url', '') <> ''
  ) t;

  return v_links;
end;
$$;

revoke all on function public.record_review_click(uuid, text) from public;
grant execute on function public.record_review_click(uuid, text) to anon, authenticated, service_role;

create or replace function public.mark_review_clicked_by_qr_token(p_token text, p_platform text default null::text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_job jobs%rowtype;
  v_recent integer;
begin
  select * into v_job from jobs where p_token is not null and length(p_token) >= 32 and qr_code_token = p_token;
  if not found then
    return;
  end if;

  update jobs set review_link_clicked = true where id = v_job.id;

  if p_platform is not null and length(trim(p_platform)) > 0 then
    select count(*) into v_recent from review_clicks where job_id = v_job.id and clicked_at > now() - interval '1 day';
    if v_recent < 30 then
      insert into review_clicks (job_id, customer_id, business_id, platform)
      values (v_job.id, v_job.customer_id, v_job.business_id, left(trim(p_platform), 50));
    end if;
  end if;
end;
$$;

-- 5. Logo uploads -------------------------------------------------------------------------------

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']
where id = 'business-logos';
