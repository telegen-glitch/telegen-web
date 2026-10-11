-- Private photo storage on Supabase (CLAUDE.md v5). The bucket "case-photos"
-- (created in 0001) is private, accepts only JPEG up to 5 MB, and is reached
-- only by the server with the secret key, after the RLS check on clinical.photos
-- and an audit entry. A restrictive policy keeps every browser-side role out of
-- this bucket even if a permissive storage policy is added later by mistake.
-- Skipped where the storage schema does not exist (local and CI PGlite).
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    execute $q$insert into storage.buckets (id, name, public) values ('case-photos', 'case-photos', false)
      on conflict (id) do nothing$q$;
    execute $q$update storage.buckets
      set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg']
      where id = 'case-photos'$q$;
    execute $q$drop policy if exists case_photos_server_only on storage.objects$q$;
    execute $q$create policy case_photos_server_only on storage.objects as restrictive
      for all to anon, authenticated
      using (bucket_id <> 'case-photos') with check (bucket_id <> 'case-photos')$q$;
  end if;
end $$;

insert into clinical_meta.migrations (name) values ('0007_storage.sql') on conflict do nothing;
