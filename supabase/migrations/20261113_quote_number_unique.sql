-- Quote numbers are random now (for example Q-4829173). This guarantees two quotes in one business can never share a number.
create unique index if not exists quotes_business_quote_number_key on public.quotes (business_id, quote_number);
