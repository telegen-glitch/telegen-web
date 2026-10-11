-- Telegen clinical core (CLAUDE.md v5). Runs on Supabase Postgres (EU) and, in
-- tests and local development, on PGlite with a small auth stub
-- (src/clinical/db/pglite.ts). Everything lives in the "clinical" schema, which
-- is NOT exposed through Supabase's REST API: the app reaches it only from the
-- server, as the signed-in user's role (RLS applies) or as service_role.
--
-- Separation rules enforced here:
--   * patients see only their own records;
--   * doctors see health data only for cases in the queue or assigned to them,
--     and only with two-factor authentication (JWT aal = aal2);
--   * pharmacies see only their orders through a narrow view: the prescription,
--     the delivery name and address, never the condition, answers or photos;
--   * admins see operational status, never answers, photos or messages;
--   * every write to a health-data table is audited by trigger, and every read
--     is audited by the app through clinical.audit(); the log never holds content.

create schema if not exists clinical;
grant usage on schema clinical to authenticated, service_role;

-- ---------------------------------------------------------------- helpers

create or replace function clinical.jwt_claim(name text) returns text
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true), '')::json ->> name
$$;

-- ---------------------------------------------------------------- people

create table clinical.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'patient' check (role in ('patient', 'doctor', 'pharmacy', 'admin')),
  email text not null,
  created_at timestamptz not null default now()
);

create or replace function clinical.my_role() returns text
language sql stable security definer set search_path = clinical, pg_temp as $$
  select role from clinical.profiles where id = auth.uid()
$$;

create or replace function clinical.is_admin() returns boolean
language sql stable security definer set search_path = clinical, pg_temp as $$
  select clinical.my_role() = 'admin' and coalesce(clinical.jwt_claim('aal'), '') = 'aal2'
$$;

create table clinical.patients (
  id uuid primary key references clinical.profiles (id) on delete cascade,
  full_name text,
  phone text,
  birth_year int check (birth_year between 1900 and 2100),
  address_line text,
  city text,
  county text,
  postal_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Doctor identities live only here (never in the repo, docs, logs or public pages).
create table clinical.doctors (
  id uuid primary key references clinical.profiles (id) on delete cascade,
  full_name text not null,
  specialty text not null check (specialty in ('dermatologie', 'urologie', 'medicina-de-familie')),
  parafa_code text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Doctors reach health data only with two-factor authentication.
create or replace function clinical.is_doctor() returns boolean
language sql stable security definer set search_path = clinical, pg_temp as $$
  select exists (
    select 1 from clinical.doctors d join clinical.profiles p on p.id = d.id
    where d.id = auth.uid() and d.active and p.role = 'doctor'
  ) and coalesce(clinical.jwt_claim('aal'), '') = 'aal2'
$$;

create table clinical.pharmacies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_account_id text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table clinical.pharmacy_members (
  profile_id uuid primary key references clinical.profiles (id) on delete cascade,
  pharmacy_id uuid not null references clinical.pharmacies (id) on delete cascade
);

create or replace function clinical.my_pharmacy_id() returns uuid
language sql stable security definer set search_path = clinical, pg_temp as $$
  select m.pharmacy_id from clinical.pharmacy_members m join clinical.profiles p on p.id = m.profile_id
  where m.profile_id = auth.uid() and p.role = 'pharmacy'
$$;

-- Versioned, timestamped consents. Insert-only: a withdrawal is a new row.
create table clinical.consents (
  id bigint generated always as identity primary key,
  patient_id uuid not null references clinical.patients (id) on delete cascade,
  kind text not null check (kind in ('gdpr_art9', 'telemedicine', 'terms', 'privacy')),
  version text not null,
  action text not null default 'accepted' check (action in ('accepted', 'withdrawn')),
  at timestamptz not null default now()
);

-- ---------------------------------------------------------------- cases

create table clinical.cases (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references clinical.patients (id) on delete cascade,
  condition text not null check (condition in ('caderea-parului', 'acnee', 'disfunctie-erectila')),
  status text not null default 'draft' check (status in (
    'draft', 'stopped', 'awaiting_payment', 'submitted', 'in_review', 'waiting_patient',
    'adjusted', 'approved', 'declined', 'expired', 'canceled'
  )),
  questionnaire_version text not null,
  price_variant text check (price_variant in ('A', 'B')),
  plan_id text,
  assigned_doctor_id uuid references clinical.doctors (id),
  decision_reason text check (decision_reason in (
    'contraindication', 'needs_in_person', 'insufficient_information', 'not_indicated', 'patient_request', 'other'
  )),
  submitted_at timestamptz,
  sla_due_at timestamptz,
  sla_paused_at timestamptz,
  decided_at timestamptz,
  test boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index cases_patient on clinical.cases (patient_id);
create index cases_queue on clinical.cases (status, sla_due_at);

-- Allowed status transitions (the state machine is enforced in the database too).
create or replace function clinical.check_case_transition() returns trigger
language plpgsql as $$
begin
  if new.status = old.status then return new; end if;
  if (old.status, new.status) not in (
    ('draft', 'stopped'), ('draft', 'awaiting_payment'), ('stopped', 'draft'),
    ('awaiting_payment', 'draft'), ('awaiting_payment', 'submitted'), ('awaiting_payment', 'canceled'),
    ('submitted', 'in_review'), ('submitted', 'expired'), ('submitted', 'canceled'),
    ('in_review', 'waiting_patient'), ('waiting_patient', 'in_review'),
    ('in_review', 'adjusted'), ('in_review', 'approved'), ('in_review', 'declined'), ('in_review', 'expired'),
    ('waiting_patient', 'expired'), ('waiting_patient', 'declined'),
    ('adjusted', 'approved'), ('adjusted', 'declined'), ('adjusted', 'canceled'), ('adjusted', 'expired')
  ) then
    raise exception 'case status % -> % is not allowed', old.status, new.status using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger case_transition before update of status on clinical.cases
  for each row execute function clinical.check_case_transition();

create or replace function clinical.owns_case(c uuid) returns boolean
language sql stable security definer set search_path = clinical, pg_temp as $$
  select exists (select 1 from clinical.cases where id = c and patient_id = auth.uid())
$$;

-- Which specialty may review which condition (CLAUDE.md §7c.G).
create or replace function clinical.specialty_fits(cond text, spec text) returns boolean
language sql immutable as $$
  select case cond
    when 'disfunctie-erectila' then spec in ('urologie', 'medicina-de-familie')
    else spec = 'dermatologie'
  end
$$;

-- A doctor (with 2FA) sees a case of their specialty waiting in the queue, or a case assigned to them.
create or replace function clinical.doctor_sees_case(c uuid) returns boolean
language sql stable security definer set search_path = clinical, pg_temp as $$
  select clinical.is_doctor() and exists (
    select 1 from clinical.cases k join clinical.doctors d on d.id = auth.uid()
    where k.id = c
      and (k.assigned_doctor_id = auth.uid()
        or (k.assigned_doctor_id is null and k.status = 'submitted' and clinical.specialty_fits(k.condition, d.specialty)))
  )
$$;

create table clinical.answers (
  case_id uuid not null references clinical.cases (id) on delete cascade,
  question_id text not null,
  answer jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (case_id, question_id)
);

create table clinical.photos (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references clinical.cases (id) on delete cascade,
  slot text not null check (slot in ('front', 'top', 'crown', 'face')),
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  unique (case_id, slot)
);

create table clinical.proposals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references clinical.cases (id) on delete cascade,
  plan_id text not null,
  billing text not null check (billing in ('monthly', 'quarterly')),
  first_amount int not null check (first_amount > 0),
  recurring_amount int not null check (recurring_amount > 0),
  currency text not null default 'RON',
  source text not null default 'system' check (source in ('system', 'doctor')),
  created_by uuid references clinical.profiles (id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index proposals_case on clinical.proposals (case_id, created_at desc);

create table clinical.payments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references clinical.cases (id) on delete cascade,
  provider text not null check (provider in ('stripe', 'fake')),
  checkout_id text unique,
  intent_id text unique,
  status text not null default 'pending' check (status in ('pending', 'authorized', 'captured', 'canceled', 'expired', 'failed')),
  amount int not null check (amount > 0),
  currency text not null default 'RON',
  authorized_at timestamptz,
  expires_at timestamptz,
  captured_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now()
);

create table clinical.subscriptions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references clinical.cases (id) on delete cascade,
  patient_id uuid not null references clinical.patients (id) on delete cascade,
  provider_id text unique,
  status text not null default 'active' check (status in ('active', 'paused', 'canceled', 'renewal_review')),
  interval_months int not null check (interval_months in (1, 3)),
  amount int not null check (amount > 0),
  next_charge_at timestamptz,
  renewal_review_at timestamptz,
  cancel_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clinical.messages (
  id bigint generated always as identity primary key,
  case_id uuid not null references clinical.cases (id) on delete cascade,
  sender_id uuid not null references clinical.profiles (id),
  sender_role text not null check (sender_role in ('patient', 'doctor')),
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index messages_case on clinical.messages (case_id, created_at);

create table clinical.prescriptions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references clinical.cases (id) on delete cascade,
  doctor_id uuid not null references clinical.doctors (id),
  items jsonb not null,
  adapter text not null default 'manual',
  issued_at timestamptz not null default now(),
  transmitted_at timestamptz
);

create table clinical.orders (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references clinical.cases (id) on delete cascade,
  prescription_id uuid references clinical.prescriptions (id),
  pharmacy_id uuid references clinical.pharmacies (id),
  status text not null default 'pending' check (status in ('pending', 'packing', 'shipped', 'delivered', 'canceled')),
  carrier text,
  tracking_code text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clinical.checkins (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references clinical.cases (id) on delete cascade,
  kind text not null check (kind in ('month1', 'month3', 'renewal')),
  due_at timestamptz not null,
  completed_at timestamptz,
  unique (case_id, kind, due_at)
);

-- Doctor pay: a flat fee per completed review, the same for approve and decline.
create table clinical.doctor_ledger (
  id bigint generated always as identity primary key,
  doctor_id uuid not null references clinical.doctors (id),
  case_id uuid not null references clinical.cases (id) on delete cascade,
  kind text not null check (kind in ('review', 'renewal_review')),
  fee int not null check (fee >= 0),
  created_at timestamptz not null default now(),
  unique (case_id, kind, doctor_id)
);

create table clinical.sla_events (
  case_id uuid not null references clinical.cases (id) on delete cascade,
  kind text not null check (kind in ('reminder_12h', 'reminder_20h', 'escalated_24h', 'authorization_expiring')),
  at timestamptz not null default now(),
  primary key (case_id, kind)
);

-- E-mail queue: a template name and opaque ids only, never content.
create table clinical.outbox (
  id bigint generated always as identity primary key,
  to_profile_id uuid not null references clinical.profiles (id) on delete cascade,
  template text not null,
  ref_id uuid,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  error text
);

-- Who touched which health record, and when. Never the content.
create table clinical.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_role text,
  action text not null check (action in ('read', 'insert', 'update', 'delete')),
  entity text not null,
  entity_id text not null,
  at timestamptz not null default now()
);
create index audit_entity on clinical.audit_log (entity, entity_id);

create or replace function clinical.audit(p_action text, p_entity text, p_entity_id text) returns void
language sql security definer set search_path = clinical, pg_temp as $$
  insert into clinical.audit_log (actor_id, actor_role, action, entity, entity_id)
  values (auth.uid(), coalesce(clinical.my_role(), clinical.jwt_claim('role')), p_action, p_entity, p_entity_id)
$$;

create or replace function clinical.audit_write() returns trigger
language plpgsql security definer set search_path = clinical, pg_temp as $$
declare rec record;
begin
  rec := case when tg_op = 'DELETE' then old else new end;
  perform clinical.audit(lower(tg_op), tg_table_name,
    coalesce(to_jsonb(rec) ->> 'id', to_jsonb(rec) ->> 'case_id'));
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['answers', 'photos', 'messages', 'prescriptions', 'proposals', 'consents', 'checkins'] loop
    execute format('create trigger audit_%1$s after insert or update or delete on clinical.%1$I for each row execute function clinical.audit_write()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------- pharmacy view

-- Exactly what a pharmacy needs to dispense and ship: no condition, no answers.
create view clinical.pharmacy_orders as
  select o.id, o.status, o.carrier, o.tracking_code, o.created_at, o.shipped_at, o.delivered_at,
         p.items as prescription_items, p.issued_at as prescribed_at,
         d.full_name as doctor_name, d.parafa_code as doctor_parafa,
         pt.full_name as ship_name, pt.phone as ship_phone, pt.address_line as ship_address,
         pt.city as ship_city, pt.county as ship_county, pt.postal_code as ship_postal_code
  from clinical.orders o
  join clinical.prescriptions p on p.id = o.prescription_id
  join clinical.doctors d on d.id = p.doctor_id
  join clinical.cases c on c.id = o.case_id
  join clinical.patients pt on pt.id = c.patient_id
  where o.pharmacy_id = clinical.my_pharmacy_id();

create or replace function clinical.pharmacy_update_order(p_order uuid, p_status text, p_carrier text, p_tracking text)
returns void language plpgsql security definer set search_path = clinical, pg_temp as $$
begin
  if p_status not in ('packing', 'shipped', 'delivered') then
    raise exception 'status not allowed' using errcode = 'check_violation';
  end if;
  update clinical.orders set
    status = p_status,
    carrier = coalesce(p_carrier, carrier),
    tracking_code = coalesce(p_tracking, tracking_code),
    shipped_at = case when p_status = 'shipped' then now() else shipped_at end,
    delivered_at = case when p_status = 'delivered' then now() else delivered_at end,
    updated_at = now()
  where id = p_order and pharmacy_id = clinical.my_pharmacy_id() and pharmacy_id is not null;
  if not found then raise exception 'order not found' using errcode = 'no_data_found'; end if;
  perform clinical.audit('update', 'orders', p_order::text);
end $$;

-- ---------------------------------------------------------------- row level security

alter table clinical.profiles enable row level security;
alter table clinical.patients enable row level security;
alter table clinical.doctors enable row level security;
alter table clinical.pharmacies enable row level security;
alter table clinical.pharmacy_members enable row level security;
alter table clinical.consents enable row level security;
alter table clinical.cases enable row level security;
alter table clinical.answers enable row level security;
alter table clinical.photos enable row level security;
alter table clinical.proposals enable row level security;
alter table clinical.payments enable row level security;
alter table clinical.subscriptions enable row level security;
alter table clinical.messages enable row level security;
alter table clinical.prescriptions enable row level security;
alter table clinical.orders enable row level security;
alter table clinical.checkins enable row level security;
alter table clinical.doctor_ledger enable row level security;
alter table clinical.sla_events enable row level security;
alter table clinical.outbox enable row level security;
alter table clinical.audit_log enable row level security;

-- profiles
create policy profiles_self on clinical.profiles for select to authenticated using (id = auth.uid());
create policy profiles_admin on clinical.profiles for select to authenticated using (clinical.is_admin());

-- patients
create policy patients_self on clinical.patients for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy patients_doctor on clinical.patients for select to authenticated using (
  exists (select 1 from clinical.cases c where c.patient_id = patients.id and clinical.doctor_sees_case(c.id))
);

-- doctors: themselves, the doctor assigned to the patient's case, admins
create policy doctors_self on clinical.doctors for select to authenticated using (id = auth.uid());
create policy doctors_for_patient on clinical.doctors for select to authenticated using (
  exists (select 1 from clinical.cases c where c.assigned_doctor_id = doctors.id and c.patient_id = auth.uid())
);
create policy doctors_admin on clinical.doctors for select to authenticated using (clinical.is_admin());

-- pharmacies
create policy pharmacies_member on clinical.pharmacies for select to authenticated using (id = clinical.my_pharmacy_id());
create policy pharmacies_admin on clinical.pharmacies for select to authenticated using (clinical.is_admin());
create policy pharmacy_members_self on clinical.pharmacy_members for select to authenticated using (profile_id = auth.uid());

-- consents: insert and read own, never edit
create policy consents_insert on clinical.consents for insert to authenticated with check (patient_id = auth.uid());
create policy consents_select on clinical.consents for select to authenticated using (patient_id = auth.uid());

-- cases
create policy cases_patient_select on clinical.cases for select to authenticated using (patient_id = auth.uid());
create policy cases_patient_insert on clinical.cases for insert to authenticated
  with check (patient_id = auth.uid() and status = 'draft' and assigned_doctor_id is null);
create policy cases_patient_update on clinical.cases for update to authenticated
  using (patient_id = auth.uid() and status in ('draft', 'stopped', 'awaiting_payment', 'adjusted'))
  with check (patient_id = auth.uid() and status in ('draft', 'stopped', 'awaiting_payment', 'canceled'));
create policy cases_doctor_select on clinical.cases for select to authenticated using (clinical.doctor_sees_case(id));
create policy cases_doctor_update on clinical.cases for update to authenticated
  using (clinical.doctor_sees_case(id)) with check (assigned_doctor_id = auth.uid());
create policy cases_admin_select on clinical.cases for select to authenticated using (clinical.is_admin());

-- answers and photos: the patient while drafting; the doctor reads
create policy answers_patient_select on clinical.answers for select to authenticated using (clinical.owns_case(case_id));
create policy answers_patient_write on clinical.answers for all to authenticated
  using (clinical.owns_case(case_id) and exists (select 1 from clinical.cases c where c.id = case_id and c.status in ('draft', 'stopped')))
  with check (clinical.owns_case(case_id) and exists (select 1 from clinical.cases c where c.id = case_id and c.status in ('draft', 'stopped')));
create policy answers_doctor on clinical.answers for select to authenticated using (clinical.doctor_sees_case(case_id));

create policy photos_patient_select on clinical.photos for select to authenticated using (clinical.owns_case(case_id));
create policy photos_patient_write on clinical.photos for all to authenticated
  using (clinical.owns_case(case_id) and exists (select 1 from clinical.cases c where c.id = case_id and c.status = 'draft'))
  with check (clinical.owns_case(case_id) and exists (select 1 from clinical.cases c where c.id = case_id and c.status = 'draft'));
create policy photos_doctor on clinical.photos for select to authenticated using (clinical.doctor_sees_case(case_id));

-- proposals: priced by the server; the patient accepts; the assigned doctor adjusts
create policy proposals_patient_select on clinical.proposals for select to authenticated using (clinical.owns_case(case_id));
create policy proposals_patient_accept on clinical.proposals for update to authenticated
  using (clinical.owns_case(case_id) and accepted_at is null) with check (clinical.owns_case(case_id));
create policy proposals_doctor_select on clinical.proposals for select to authenticated using (clinical.doctor_sees_case(case_id));
create policy proposals_doctor_insert on clinical.proposals for insert to authenticated
  with check (clinical.doctor_sees_case(case_id) and source = 'doctor' and created_by = auth.uid());

-- payments and subscriptions: written by the server (webhooks); read by the owner and admins
create policy payments_patient on clinical.payments for select to authenticated using (clinical.owns_case(case_id));
create policy payments_admin on clinical.payments for select to authenticated using (clinical.is_admin());
create policy subscriptions_patient on clinical.subscriptions for select to authenticated using (patient_id = auth.uid());
create policy subscriptions_admin on clinical.subscriptions for select to authenticated using (clinical.is_admin());

-- messages
create policy messages_patient_select on clinical.messages for select to authenticated using (clinical.owns_case(case_id));
create policy messages_patient_insert on clinical.messages for insert to authenticated
  with check (clinical.owns_case(case_id) and sender_id = auth.uid() and sender_role = 'patient');
create policy messages_doctor_select on clinical.messages for select to authenticated using (clinical.doctor_sees_case(case_id));
create policy messages_doctor_insert on clinical.messages for insert to authenticated
  with check (clinical.doctor_sees_case(case_id) and sender_id = auth.uid() and sender_role = 'doctor');

-- prescriptions
create policy prescriptions_patient on clinical.prescriptions for select to authenticated using (clinical.owns_case(case_id));
create policy prescriptions_doctor_select on clinical.prescriptions for select to authenticated using (clinical.doctor_sees_case(case_id));
create policy prescriptions_doctor_insert on clinical.prescriptions for insert to authenticated
  with check (clinical.doctor_sees_case(case_id) and doctor_id = auth.uid());

-- orders: the patient sees status and tracking; pharmacies use the view; admins see status
create policy orders_patient on clinical.orders for select to authenticated using (clinical.owns_case(case_id));
create policy orders_admin on clinical.orders for select to authenticated using (clinical.is_admin());

-- check-ins
create policy checkins_patient on clinical.checkins for select to authenticated using (clinical.owns_case(case_id));
create policy checkins_patient_complete on clinical.checkins for update to authenticated
  using (clinical.owns_case(case_id)) with check (clinical.owns_case(case_id));
create policy checkins_doctor on clinical.checkins for select to authenticated using (clinical.doctor_sees_case(case_id));

-- ledger, SLA events, audit: own rows for doctors, admins read; writes by the server only
create policy ledger_doctor on clinical.doctor_ledger for select to authenticated using (doctor_id = auth.uid() and clinical.is_doctor());
create policy ledger_admin on clinical.doctor_ledger for select to authenticated using (clinical.is_admin());
create policy sla_admin on clinical.sla_events for select to authenticated using (clinical.is_admin());
create policy audit_admin on clinical.audit_log for select to authenticated using (clinical.is_admin());
-- outbox: no policy for authenticated (server only)

-- ---------------------------------------------------------------- grants

grant select on clinical.profiles, clinical.doctors, clinical.pharmacies, clinical.pharmacy_members,
  clinical.payments, clinical.subscriptions, clinical.orders, clinical.doctor_ledger, clinical.sla_events,
  clinical.audit_log, clinical.pharmacy_orders to authenticated;
grant select, insert, update on clinical.patients to authenticated;
grant select, insert on clinical.consents to authenticated;
grant select, insert, update on clinical.cases to authenticated;
grant select, insert, update, delete on clinical.answers, clinical.photos to authenticated;
grant select, insert, update on clinical.proposals to authenticated;
grant select, insert on clinical.messages, clinical.prescriptions to authenticated;
grant select, update on clinical.checkins to authenticated;
grant execute on all functions in schema clinical to authenticated;
grant all on all tables in schema clinical to service_role;
grant usage on all sequences in schema clinical to authenticated, service_role;

-- Private photo bucket on Supabase Storage (skipped where the storage schema does not exist).
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    execute $q$insert into storage.buckets (id, name, public) values ('case-photos', 'case-photos', false)
      on conflict (id) do nothing$q$;
  end if;
end $$;
