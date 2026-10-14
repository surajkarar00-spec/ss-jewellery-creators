-- SS Jewellery Creators: private model files, public previews, owner-managed listings.
-- Run this once in Supabase Dashboard > SQL Editor.

create table if not exists public.jewellery_models (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 90),
  description text not null default '' check (char_length(description) <= 1200),
  category text not null check (category in ('rings', 'necklaces', 'earrings', 'pendants', 'bracelets')),
  price numeric(10, 2) not null default 0 check (price >= 0 and price <= 500),
  model_path text not null unique,
  preview_path text not null unique,
  model_filename text not null,
  model_size_bytes bigint not null check (model_size_bytes > 0 and model_size_bytes <= 52428800),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.jewellery_models enable row level security;
grant select on table public.jewellery_models to anon, authenticated;
grant insert, update, delete on table public.jewellery_models to authenticated;

drop policy if exists "Public can view published jewellery models" on public.jewellery_models;
create policy "Public can view published jewellery models"
  on public.jewellery_models for select
  using (is_published or (select auth.uid()) = owner_id);

drop policy if exists "Creators can add their own jewellery models" on public.jewellery_models;
create policy "Creators can add their own jewellery models"
  on public.jewellery_models for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Creators can update their own jewellery models" on public.jewellery_models;
create policy "Creators can update their own jewellery models"
  on public.jewellery_models for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Creators can delete their own jewellery models" on public.jewellery_models;
create policy "Creators can delete their own jewellery models"
  on public.jewellery_models for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('jewellery-model-files', 'jewellery-model-files', false, 52428800),
  ('jewellery-previews', 'jewellery-previews', true, 5242880)
on conflict (id) do update
set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "Creators can upload their own model files" on storage.objects;
create policy "Creators can upload their own model files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'jewellery-model-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Creators can view their own model files" on storage.objects;
create policy "Creators can view their own model files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'jewellery-model-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Creators can delete their own model files" on storage.objects;
create policy "Creators can delete their own model files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'jewellery-model-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Anyone can view jewellery previews" on storage.objects;
create policy "Anyone can view jewellery previews"
  on storage.objects for select
  using (bucket_id = 'jewellery-previews');

drop policy if exists "Creators can upload their own jewellery previews" on storage.objects;
create policy "Creators can upload their own jewellery previews"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'jewellery-previews'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Creators can delete their own jewellery previews" on storage.objects;
create policy "Creators can delete their own jewellery previews"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'jewellery-previews'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
