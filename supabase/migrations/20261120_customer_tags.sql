-- Free-text tags on a customer (for example "landlord" or "commercial"). Existing row-level security on customers covers them.
alter table public.customers add column if not exists tags text[] not null default '{}';
create index if not exists customers_tags_gin on public.customers using gin (tags);
