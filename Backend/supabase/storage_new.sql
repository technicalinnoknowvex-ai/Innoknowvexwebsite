insert into storage.buckets (id, name, public)
values
  ('program-images', 'program-images', true),
  ('program-brochures', 'program-brochures', true),
  ('blog_images', 'blog_images', true),
  ('testimonial-images', 'testimonial-images', true),
  ('partner-logos', 'partner-logos', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read managed media new" on storage.objects;
create policy "Public can read managed media new"
  on storage.objects for select
  using (bucket_id in ('program-images', 'program-brochures', 'blog_images', 'testimonial-images', 'partner-logos'));

drop policy if exists "Admins can upload managed media new" on storage.objects;
create policy "Admins can upload managed media new"
  on storage.objects for insert
  with check (
    bucket_id in ('program-images', 'program-brochures', 'blog_images', 'testimonial-images', 'partner-logos')
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "Admins can update managed media new" on storage.objects;
create policy "Admins can update managed media new"
  on storage.objects for update
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete managed media new" on storage.objects;
create policy "Admins can delete managed media new"
  on storage.objects for delete
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');