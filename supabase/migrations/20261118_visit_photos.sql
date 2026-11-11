-- Photos on visits - 2026-11-18
--
-- visit-photos: a private storage bucket. Files live under <business id>/<visit id>/..., and a signed-in team member can
--               only read, add or remove files in their own business's folder.
-- visit_photos: one row per photo (the full picture and a small preview), optionally tied to a step of a checklist,
--               with a caption and a Before / After tag. At most 40 photos per visit.
-- The app removes the files when a photo or its visit is deleted.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('visit-photos', 'visit-photos', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "visit photos read own folder" on storage.objects;
create policy "visit photos read own folder" on storage.objects for select to authenticated
  using (bucket_id = 'visit-photos' and (storage.foldername(name))[1] = (select u.business_id::text from public.users u where u.id = (select auth.uid())));

drop policy if exists "visit photos insert own folder" on storage.objects;
create policy "visit photos insert own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'visit-photos' and (storage.foldername(name))[1] = (select u.business_id::text from public.users u where u.id = (select auth.uid())));

drop policy if exists "visit photos delete own folder" on storage.objects;
create policy "visit photos delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'visit-photos' and (storage.foldername(name))[1] = (select u.business_id::text from public.users u where u.id = (select auth.uid())));

create table if not exists public.visit_photos (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  visit_id uuid not null references public.job_visits(id) on delete cascade,
  checklist_id uuid references public.visit_checklists(id) on delete set null,
  item_id text check (item_id is null or char_length(item_id) <= 64),
  path text not null,
  thumb_path text not null,
  caption text check (caption is null or char_length(caption) <= 200),
  tag text check (tag is null or tag in ('before', 'after')),
  width integer check (width is null or width between 1 and 20000),
  height integer check (height is null or height between 1 and 20000),
  created_at timestamptz not null default now(),
  constraint visit_photos_path_check check (
    path like business_id::text || '/' || visit_id::text || '/%'
    and thumb_path like business_id::text || '/' || visit_id::text || '/%'
  )
);

create index if not exists visit_photos_visit_idx on public.visit_photos (visit_id, created_at);
create index if not exists visit_photos_checklist_idx on public.visit_photos (checklist_id) where checklist_id is not null;

alter table public.visit_photos enable row level security;

drop policy if exists "business members manage visit photos" on public.visit_photos;
create policy "business members manage visit photos" on public.visit_photos for all to authenticated
  using (business_id = (select u.business_id from public.users u where u.id = (select auth.uid())))
  with check (
    business_id = (select u.business_id from public.users u where u.id = (select auth.uid()))
    and exists (select 1 from public.job_visits v where v.id = visit_id and v.business_id = visit_photos.business_id)
    and (checklist_id is null or exists (select 1 from public.visit_checklists c where c.id = checklist_id and c.visit_id = visit_photos.visit_id and c.business_id = visit_photos.business_id))
  );

create or replace function public.limit_visit_photos() returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select count(*) from public.visit_photos where visit_id = new.visit_id) >= 40 then
    raise exception 'A visit can hold up to 40 photos';
  end if;
  return new;
end;
$$;

drop trigger if exists visit_photos_limit on public.visit_photos;
create trigger visit_photos_limit before insert on public.visit_photos
  for each row execute function public.limit_visit_photos();
