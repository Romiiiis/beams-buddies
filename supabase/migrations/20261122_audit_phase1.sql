-- Audit phase 1 - 2026-11-16
--
-- 1. jobs.equipment_type only accepted the five air-conditioning types, so every other industry's job
--    (plumbing "hot_water_system", electrical "switchboard", ...) was refused. The list of types lives in
--    lib/industry-config.ts; the database now only checks that the value is a short, simple code.
-- 2. Invoice numbers were "how many invoices exist + 1", which repeats a number after an invoice is deleted.
--    Numbers now come from the highest existing number, and the database refuses a repeat within a business.

-- 1. Equipment types ---------------------------------------------------------------------------------

alter table public.jobs drop constraint if exists jobs_equipment_type_check;
alter table public.jobs add constraint jobs_equipment_type_check check (equipment_type ~ '^[a-z0-9_]{1,60}$');

-- 2. Invoice numbers ---------------------------------------------------------------------------------

create unique index if not exists invoices_business_number_key on public.invoices (business_id, invoice_number);

-- The next free number for the signed-in user's own business (INV-0001, INV-0002, ...). It runs with the
-- caller's own access, so it can only ever see that business's invoices.
create or replace function public.next_invoice_number()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select 'INV-' || lpad((coalesce(max((substring(i.invoice_number from '(\d{1,9})$'))::bigint), 0) + 1)::text, 4, '0')
  from public.invoices i
  where i.business_id = (select u.business_id from public.users u where u.id = (select auth.uid()));
$$;

revoke all on function public.next_invoice_number() from public, anon;
grant execute on function public.next_invoice_number() to authenticated;
