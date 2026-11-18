-- Card payments through Stripe Connect. Each business connects its own Stripe account; Jobyra creates a checkout
-- page for the exact amount owing on an invoice, and a webhook records the payment when Stripe says it succeeded.

-- Which Stripe account belongs to which business. Members can read it; only the server (service role) writes it.
create table if not exists public.business_stripe (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  account_id text not null,
  charges_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.business_stripe enable row level security;
drop policy if exists "members read stripe status" on public.business_stripe;
create policy "members read stripe status" on public.business_stripe for select to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())));
revoke all on public.business_stripe from anon, authenticated;
grant select on public.business_stripe to authenticated;

-- One payment per Stripe checkout session, so a repeated webhook can never record it twice.
alter table public.invoice_payments add column if not exists stripe_session_id text;
create unique index if not exists invoice_payments_stripe_session_key on public.invoice_payments(stripe_session_id) where stripe_session_id is not null;

-- The public invoice page learns whether card payment is available through Stripe.
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
  v_bank boolean;
  v_stripe boolean;
begin
  select * into i from public.invoices where public_token = p_token;
  if not found or i.status = 'draft' then
    return null;
  end if;

  select name, phone, email, logo_url, abn, address into b from public.businesses where id = i.business_id;
  select bank_name, account_name, bsb, account_number, payment_terms, invoice_notes, payment_mode, payid, card_link
    into s from public.business_settings where business_id = i.business_id;
  select first_name, last_name into c from public.customers where id = i.customer_id;

  if i.viewed_at is null then
    update public.invoices set viewed_at = now() where id = i.id;
  end if;

  v_bank := coalesce(s.payment_mode, 'bank') <> 'card';
  v_stripe := coalesce(s.payment_mode, 'bank') in ('card', 'both')
    and exists (select 1 from public.business_stripe bs where bs.business_id = i.business_id and bs.charges_enabled);

  return jsonb_build_object(
    'business', jsonb_build_object('name', b.name, 'phone', b.phone, 'email', b.email, 'logo_url', b.logo_url, 'abn', b.abn, 'address', b.address),
    'payment', jsonb_build_object(
      'mode', coalesce(s.payment_mode, 'bank'),
      'bank_name', case when v_bank then s.bank_name end,
      'account_name', case when v_bank then s.account_name end,
      'bsb', case when v_bank then s.bsb end,
      'account_number', case when v_bank then s.account_number end,
      'payid', case when v_bank then s.payid end,
      'card_link', case when coalesce(s.payment_mode, 'bank') in ('card', 'both') then s.card_link end,
      'card_stripe', v_stripe,
      'payment_terms', s.payment_terms,
      'invoice_notes', s.invoice_notes
    ),
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
      'paid_at', i.paid_at,
      'payment_reported_at', i.payment_reported_at
    ),
    'payments', coalesce(
      (select jsonb_agg(jsonb_build_object('amount', p.amount, 'paid_on', p.paid_on, 'method', p.method) order by p.paid_on, p.created_at)
         from public.invoice_payments p where p.invoice_id = i.id),
      '[]'::jsonb
    )
  );
end;
$$;
revoke all on function public.get_public_invoice(uuid) from public;
grant execute on function public.get_public_invoice(uuid) to anon, authenticated;
