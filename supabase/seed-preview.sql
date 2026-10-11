-- PREVIEW ONLY. Never run this on the production project.
-- Test data for the preview Supabase project, every row marked TEST. Doctors,
-- pharmacy staff and admins are not seeded: they sign in with real e-mail codes,
-- so the admin (ADMIN_EMAILS) creates them in /admin; for previews, name them
-- "Medic TEST …" and use your own e-mail aliases.
insert into clinical.pharmacies (id, name)
values ('00000000-0000-4000-8000-00000000fa01', 'Farmacie TEST (preview)')
on conflict (id) do nothing;
