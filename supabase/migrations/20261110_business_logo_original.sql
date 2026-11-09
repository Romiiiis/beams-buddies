-- Keep the logo file exactly as uploaded, so a saved logo can be re-adjusted later
-- without losing anything an earlier crop cut off. (Applied as "business_logo_original_url".)
alter table public.businesses add column if not exists logo_original_url text;
