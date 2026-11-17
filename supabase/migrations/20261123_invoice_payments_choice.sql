-- How a business wants to be paid, and a customer telling the business they have paid.
-- payment_mode: 'bank' (bank transfer details), 'card' (the business's own card payment link),
-- 'both', or 'off' (no Pay now button; invoices look as they always did).
alter table public.business_settings
  add column if not exists payment_mode text not null default 'bank',
  add column if not exists payid text,
  add column if not exists card_link text;
alter table public.business_settings drop constraint if exists business_settings_payment_mode_check;
alter table public.business_settings add constraint business_settings_payment_mode_check check (payment_mode in ('off', 'bank', 'card', 'both'));
alter table public.business_settings drop constraint if exists business_settings_card_link_check;
alter table public.business_settings add constraint business_settings_card_link_check check (card_link is null or (card_link ~* '^https://' and char_length(card_link) <= 500));
alter table public.business_settings drop constraint if exists business_settings_payid_check;
alter table public.business_settings add constraint business_settings_payid_check check (payid is null or char_length(payid) <= 120);

alter table public.invoices add column if not exists payment_reported_at timestamptz;

-- The public invoice page: now also says how this business takes payment. Bank details are left out when the
-- business only takes cards.
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
