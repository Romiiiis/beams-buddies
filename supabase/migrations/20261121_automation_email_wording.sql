-- A business's own wording for an automation email. Empty means the standard wording.
alter table public.automation_settings
  add column if not exists subject text,
  add column if not exists intro text,
  add column if not exists closing text;
alter table public.automation_settings drop constraint if exists automation_copy_length;
alter table public.automation_settings add constraint automation_copy_length
  check (char_length(coalesce(subject, '')) <= 150 and char_length(coalesce(intro, '')) <= 1000 and char_length(coalesce(closing, '')) <= 1000);
