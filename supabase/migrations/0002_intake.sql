-- P1 intake (CLAUDE.md v5): readiness check for the launch gate.

-- How many active doctors of a specialty have a verified second factor. Security
-- definer because auth.mfa_factors is not readable by the app roles; returns a
-- count only, never an identity.
create or replace function clinical.doctors_ready(spec text) returns int
language sql stable security definer set search_path = clinical, auth, pg_temp as $$
  select count(*)::int from clinical.doctors d
  where d.active and d.specialty = spec
    and exists (select 1 from auth.mfa_factors f where f.user_id = d.id and f.status = 'verified')
$$;
revoke execute on function clinical.doctors_ready(text) from public, authenticated;
grant execute on function clinical.doctors_ready(text) to service_role;

insert into clinical_meta.migrations (name) values ('0002_intake.sql') on conflict do nothing;
