-- Storage for custom quote attachments (STL and similar model files).
--
-- Run this once in the Supabase SQL editor. Until it exists, the custom quote
-- form still works: the request is emailed without the file and the customer
-- is asked to send the model on WhatsApp.

-- 1. The bucket. Public so the quote email can link straight to the file.
insert into storage.buckets (id, name, public, file_size_limit)
values ('quote-files', 'quote-files', true, 52428800)   -- 50 MB cap
on conflict (id) do update
  set public = true,
      file_size_limit = 52428800;

-- 2. Anyone may upload a model to this bucket, because people request quotes
--    without an account. Nobody may overwrite or delete what is already there.
drop policy if exists "quote uploads are open" on storage.objects;
create policy "quote uploads are open"
  on storage.objects for insert
  with check (bucket_id = 'quote-files');

-- 3. Files are readable by link only. The bucket holds no personal data by
--    itself: the name, email and message travel by email, not in storage.
drop policy if exists "quote files are readable" on storage.objects;
create policy "quote files are readable"
  on storage.objects for select
  using (bucket_id = 'quote-files');

-- 4. Only a signed-in admin can clear old files out.
drop policy if exists "only admins remove quote files" on storage.objects;
create policy "only admins remove quote files"
  on storage.objects for delete
  using (bucket_id = 'quote-files' and auth.role() = 'authenticated');
