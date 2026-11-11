-- Quote to cash - 2026-11-12
--
-- products:          the price list (saved services and parts), picked from inside quotes and invoices.
-- quotes:            a private link for the customer, plus when it was sent, viewed and answered.
-- invoices:          a private link for the customer, plus sent and viewed times.
-- invoice_payments:  every payment against an invoice. invoices.amount_paid, status and paid_at follow it automatically.
-- get_public_quote, respond_public_quote, get_public_invoice:
--                    the only way an anonymous visitor reaches a quote or invoice, and only with its private token.
--                    They return a fixed set of fields and never expose the tables.

-- 1. Price list ---------------------------------------------------------------------------------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text check (description is null or char_length(description) <= 500),
  kind text not null default 'service' check (kind in ('service', 'product')),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  unit_cost numeric(12,2) check (unit_cost is null or unit_cost >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_business_idx on public.products(business_id, active);

alter table public.products enable row level security;

drop policy if exists "business members manage products" on public.products;
create policy "business members manage products" on public.products for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));

-- 2. Quotes: private link, tracking, deposit -----------------------------------------------------

alter table public.quotes
  add column if not exists public_token uuid not null default gen_random_uuid(),
  add column if not exists sent_at timestamptz,
  add column if not exists viewed_at timestamptz,
  add column if not exists responded_at timestamptz,
  add column if not exists responded_name text,
  add column if not exists response_message text,
  add column if not exists deposit_percent numeric(5,2),
  add column if not exists accepted_optional jsonb not null default '[]'::jsonb;

alter table public.quotes drop constraint if exists quotes_deposit_percent_check;
alter table public.quotes add constraint quotes_deposit_percent_check
  check (deposit_percent is null or (deposit_percent > 0 and deposit_percent <= 100));

create unique index if not exists quotes_public_token_key on public.quotes(public_token);

-- 3. Invoices: private link, tracking ------------------------------------------------------------

alter table public.invoices
  add column if not exists public_token uuid not null default gen_random_uuid(),
  add column if not exists sent_at timestamptz,
  add column if not exists viewed_at timestamptz;

create unique index if not exists invoices_public_token_key on public.invoices(public_token);

-- 4. Payment history -----------------------------------------------------------------------------

create table if not exists public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  paid_on date not null default current_date,
  method text not null default 'bank_transfer' check (method in ('bank_transfer', 'card', 'cash', 'cheque', 'other')),
  note text check (note is null or char_length(note) <= 300),
  created_at timestamptz not null default now()
);

create index if not exists invoice_payments_invoice_idx on public.invoice_payments(invoice_id);
create index if not exists invoice_payments_business_idx on public.invoice_payments(business_id, paid_on);

alter table public.invoice_payments enable row level security;

drop policy if exists "business members manage payments" on public.invoice_payments;
create policy "business members manage payments" on public.invoice_payments for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (
    business_id = (select u.business_id from public.users u where u.id = (select auth.uid()))
    and exists (select 1 from public.invoices i where i.id = invoice_id and i.business_id = invoice_payments.business_id)
  );

-- Keeps invoices.amount_paid, status and paid_at in step with the payment rows.
create or replace function public.recompute_invoice_paid(p_invoice uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_paid numeric(12,2);
  v_total numeric(12,2);
  v_status text;
begin
  select total, status into v_total, v_status from public.invoices where id = p_invoice;
  if not found then
    return;
  end if;
  select coalesce(sum(amount), 0) into v_paid from public.invoice_payments where invoice_id = p_invoice;

  update public.invoices set
    amount_paid = v_paid,
    status = case
      when v_status = 'cancelled' then v_status
      when v_total > 0 and v_paid >= v_total - 0.005 then 'paid'
      when v_status = 'paid' then 'sent'
      when v_status = 'draft' and v_paid > 0 then 'sent'
      else v_status
    end,
    paid_at = case
      when v_status = 'cancelled' then paid_at
      when v_total > 0 and v_paid >= v_total - 0.005 then coalesce(paid_at, now())
      when v_status = 'paid' then null
      else paid_at
    end
  where id = p_invoice;
end;
$$;

revoke all on function public.recompute_invoice_paid(uuid) from public, anon, authenticated;

create or replace function public.invoice_payments_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recompute_invoice_paid(old.invoice_id);
  else
    perform public.recompute_invoice_paid(new.invoice_id);
    if tg_op = 'UPDATE' and old.invoice_id <> new.invoice_id then
      perform public.recompute_invoice_paid(old.invoice_id);
    end if;
  end if;
  return null;
end;
$$;

revoke all on function public.invoice_payments_sync() from public, anon, authenticated;

drop trigger if exists invoice_payments_sync on public.invoice_payments;
create trigger invoice_payments_sync
  after insert or update or delete on public.invoice_payments
  for each row execute function public.invoice_payments_sync();

-- Invoices that were marked paid (or part paid) before payment history existed get one matching payment,
-- so their numbers stay the same and the history is complete from today.
insert into public.invoice_payments (business_id, invoice_id, amount, paid_on, method, note)
select i.business_id, i.id,
       case when i.status = 'paid' then i.total else i.amount_paid end,
       coalesce(i.paid_at::date, i.created_at::date),
       'other',
       'Recorded before payment history was added'
from public.invoices i
where ((i.status = 'paid' and i.total > 0) or i.amount_paid > 0)
  and not exists (select 1 from public.invoice_payments p where p.invoice_id = i.id);

-- 5. What a customer can see with a quote or invoice link ---------------------------------------

create or replace function public.get_public_quote(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  q record;
  b record;
  s record;
  c record;
begin
  select * into q from public.quotes where public_token = p_token;
  if not found or q.status = 'draft' then
    return null;
  end if;

  select name, phone, email, logo_url, abn, address into b from public.businesses where id = q.business_id;
  select bank_name, account_name, bsb, account_number, payment_terms into s from public.business_settings where business_id = q.business_id;
  select first_name, last_name into c from public.customers where id = q.customer_id;

  if q.viewed_at is null then
    update public.quotes set viewed_at = now() where id = q.id;
  end if;

  return jsonb_build_object(
    'business', jsonb_build_object('name', b.name, 'phone', b.phone, 'email', b.email, 'logo_url', b.logo_url, 'abn', b.abn, 'address', b.address),
    'payment', jsonb_build_object('bank_name', s.bank_name, 'account_name', s.account_name, 'bsb', s.bsb, 'account_number', s.account_number),
    'customer', jsonb_build_object('first_name', c.first_name, 'last_name', c.last_name),
    'quote', jsonb_build_object(
      'quote_number', q.quote_number,
      'status', q.status,
      'line_items', q.line_items,
      'subtotal', q.subtotal,
      'tax_rate', q.tax_rate,
      'tax_amount', q.tax_amount,
      'total', q.total,
      'notes', q.notes,
      'valid_until', q.valid_until,
      'created_at', q.created_at,
      'deposit_percent', q.deposit_percent,
      'responded_at', q.responded_at,
      'responded_name', q.responded_name,
      'response_message', q.response_message,
      'accepted_optional', q.accepted_optional
    )
  );
end;
$$;

create or replace function public.respond_public_quote(
  p_token uuid,
  p_action text,
  p_name text,
  p_message text default null,
  p_optional integer[] default '{}'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  q record;
  v_name text := left(nullif(btrim(coalesce(p_name, '')), ''), 120);
  v_msg text := left(nullif(btrim(coalesce(p_message, '')), ''), 1000);
  v_sub numeric(12,2) := 0;
  v_tax numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_sel integer[] := '{}';
  v_status text;
  v_biz record;
  v_cust record;
begin
  if p_action is null or p_action not in ('accept', 'decline', 'question') then
    return jsonb_build_object('ok', false, 'error', 'bad_action');
  end if;

  select * into q from public.quotes where public_token = p_token for update;
  if not found or q.status = 'draft' then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_name is null or char_length(v_name) < 2 then
    return jsonb_build_object('ok', false, 'error', 'name_required');
  end if;
  if p_action = 'question' and v_msg is null then
    return jsonb_build_object('ok', false, 'error', 'message_required');
  end if;

  if p_action in ('accept', 'decline') and q.status <> 'sent' then
    return jsonb_build_object('ok', false, 'error', 'already_answered', 'status', q.status);
  end if;
  if p_action = 'accept' and q.valid_until is not null and q.valid_until < current_date then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;
  if p_action = 'question' and q.responded_at is not null and q.responded_at > now() - interval '2 minutes' then
    return jsonb_build_object('ok', false, 'error', 'slow_down');
  end if;

  v_status := q.status;

  if p_action = 'accept' then
    -- The total is worked out here from the saved line items, never taken from the browser.
    select coalesce(sum(coalesce((e.item ->> 'qty')::numeric, 0) * coalesce((e.item ->> 'unit_price')::numeric, 0)), 0)
      into v_sub
      from jsonb_array_elements(q.line_items) with ordinality as e(item, ord)
     where not coalesce((e.item ->> 'optional')::boolean, false)
        or (e.ord - 1)::int = any (coalesce(p_optional, '{}'));

    select coalesce(array_agg((e.ord - 1)::int order by e.ord), '{}')
      into v_sel
      from jsonb_array_elements(q.line_items) with ordinality as e(item, ord)
     where coalesce((e.item ->> 'optional')::boolean, false)
       and (e.ord - 1)::int = any (coalesce(p_optional, '{}'));

    v_tax := round(v_sub * coalesce(q.tax_rate, 10) / 100, 2);
    v_total := v_sub + v_tax;
    v_status := 'accepted';

    update public.quotes
       set status = 'accepted', responded_at = now(), responded_name = v_name, response_message = v_msg,
           subtotal = v_sub, tax_amount = v_tax, total = v_total, accepted_optional = to_jsonb(v_sel)
     where id = q.id;
  elsif p_action = 'decline' then
    v_status := 'declined';
    v_total := q.total;
    update public.quotes
       set status = 'declined', responded_at = now(), responded_name = v_name, response_message = v_msg
     where id = q.id;
  else
    v_total := q.total;
    update public.quotes
       set responded_at = now(), responded_name = v_name, response_message = v_msg
     where id = q.id;
  end if;

  select name, email into v_biz from public.businesses where id = q.business_id;
  select first_name, last_name into v_cust from public.customers where id = q.customer_id;

  return jsonb_build_object(
    'ok', true,
    'action', p_action,
    'status', v_status,
    'total', v_total,
    'notify', jsonb_build_object(
      'business_name', v_biz.name,
      'business_email', v_biz.email,
      'quote_number', q.quote_number,
      'customer_name', btrim(coalesce(v_cust.first_name, '') || ' ' || coalesce(v_cust.last_name, '')),
      'signed_name', v_name,
      'message', v_msg
    )
  );
end;
$$;

create or replace function public.get_public_invoice(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  i record;
  b record;
  s record;
  c record;
begin
  select * into i from public.invoices where public_token = p_token;
  if not found or i.status = 'draft' then
    return null;
  end if;

  select name, phone, email, logo_url, abn, address into b from public.businesses where id = i.business_id;
  select bank_name, account_name, bsb, account_number, payment_terms, invoice_notes into s from public.business_settings where business_id = i.business_id;
  select first_name, last_name into c from public.customers where id = i.customer_id;

  if i.viewed_at is null then
    update public.invoices set viewed_at = now() where id = i.id;
  end if;

  return jsonb_build_object(
    'business', jsonb_build_object('name', b.name, 'phone', b.phone, 'email', b.email, 'logo_url', b.logo_url, 'abn', b.abn, 'address', b.address),
    'payment', jsonb_build_object('bank_name', s.bank_name, 'account_name', s.account_name, 'bsb', s.bsb, 'account_number', s.account_number, 'payment_terms', s.payment_terms, 'invoice_notes', s.invoice_notes),
    'customer', jsonb_build_object('first_name', c.first_name, 'last_name', c.last_name),
    'invoice', jsonb_build_object(
      'invoice_number', i.invoice_number,
      'status', i.status,
      'line_items', i.line_items,
      'subtotal', i.subtotal,
      'tax_rate', i.tax_rate,
      'tax_amount', i.tax_amount,
      'total', i.total,
      'amount_paid', i.amount_paid,
      'notes', i.notes,
      'due_date', i.due_date,
      'created_at', i.created_at,
      'paid_at', i.paid_at
    ),
    'payments', coalesce(
      (select jsonb_agg(jsonb_build_object('amount', p.amount, 'paid_on', p.paid_on, 'method', p.method) order by p.paid_on, p.created_at)
         from public.invoice_payments p where p.invoice_id = i.id),
      '[]'::jsonb
    )
  );
end;
$$;

revoke all on function public.get_public_quote(uuid) from public;
revoke all on function public.respond_public_quote(uuid, text, text, text, integer[]) from public;
revoke all on function public.get_public_invoice(uuid) from public;
grant execute on function public.get_public_quote(uuid) to anon, authenticated;
grant execute on function public.respond_public_quote(uuid, text, text, text, integer[]) to anon, authenticated;
grant execute on function public.get_public_invoice(uuid) to anon, authenticated;
