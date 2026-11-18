-- The public invoice page also shows the customer's address (the service address) under their name.
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
  select first_name, last_name, address, suburb into c from public.customers where id = i.customer_id;

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
    'customer', jsonb_build_object('first_name', c.first_name, 'last_name', c.last_name, 'address', c.address, 'suburb', c.suburb),
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
