-- Per-business sending domain for reminder emails - 2026-11-03
--
-- When a business's own domain (e.g. avalancheair.com.au) is verified in Jobyra's Resend account,
-- reminders go out from reminders@<that domain> instead of reminders@mail.jobyra.app.
--
-- Security: every business sends through the same Resend account, so a business must never be
-- able to pick its own sending domain (it could then send as another business). These two
-- columns can only be changed by the Jobyra owner (SQL editor / service role), never from the app.

alter table public.businesses add column if not exists email_domain text;
alter table public.businesses add column if not exists email_domain_verified boolean not null default false;

create or replace function public.protect_business_email_domain()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon')
     and (new.email_domain is distinct from old.email_domain
          or new.email_domain_verified is distinct from old.email_domain_verified) then
    raise exception 'The sending domain can only be changed by Jobyra support';
  end if;
  return new;
end;
$$;

revoke execute on function public.protect_business_email_domain() from public, anon, authenticated;

drop trigger if exists businesses_protect_email_domain on public.businesses;
create trigger businesses_protect_email_domain
  before update on public.businesses
  for each row execute function public.protect_business_email_domain();
