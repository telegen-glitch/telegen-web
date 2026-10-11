-- P5 subscriptions, renewals, check-ins, data rights (CLAUDE.md v5).

alter table clinical.subscriptions add column if not exists plan_id text;
alter table clinical.subscriptions add column if not exists billing text check (billing in ('monthly', 'quarterly'));
alter table clinical.subscriptions add column if not exists paused_at timestamptz;
alter table clinical.subscriptions add column if not exists upcoming_notice_for timestamptz;

alter table clinical.payments add column if not exists purpose text not null default 'first_order'
  check (purpose in ('first_order', 'renewal'));
alter table clinical.payments add column if not exists invoice_ref text unique;

-- Check-in answers (health data: the patient and the doctor on the case, never admins).
alter table clinical.checkins add column if not exists answers jsonb;
alter table clinical.checkins add column if not exists reviewed_at timestamptz;
alter table clinical.checkins add column if not exists decision text check (decision in ('continue', 'stop'));
create policy checkins_doctor_review on clinical.checkins for update to authenticated
  using (clinical.doctor_sees_case(case_id)) with check (clinical.doctor_sees_case(case_id));

-- Requests to erase data that the law requires to keep for a while (medical records).
create table if not exists clinical.deletion_requests (
  id bigint generated always as identity primary key,
  patient_id uuid not null references clinical.patients (id) on delete cascade,
  requested_at timestamptz not null default now(),
  handled_at timestamptz
);
alter table clinical.deletion_requests enable row level security;
create policy deletion_requests_admin on clinical.deletion_requests for select to authenticated using (clinical.is_admin());
create policy deletion_requests_self on clinical.deletion_requests for select to authenticated using (patient_id = auth.uid());
grant select on clinical.deletion_requests to authenticated;
grant all on clinical.deletion_requests to service_role;

-- When the patient was told a check-in is due (once).
alter table clinical.checkins add column if not exists notified_at timestamptz;

-- A patient who withdraws consent or leaves can end an open case at any stage before the decision.
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
    ('adjusted', 'approved'), ('adjusted', 'declined'), ('adjusted', 'canceled'), ('adjusted', 'expired'),
    ('draft', 'canceled'), ('stopped', 'canceled'), ('in_review', 'canceled'), ('waiting_patient', 'canceled')
  ) then
    raise exception 'case status % -> % is not allowed', old.status, new.status using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;

-- Renewal reviews repeat (every N months): one ledger entry per review, keyed by its check-in.
alter table clinical.doctor_ledger add column if not exists ref text not null default '';
alter table clinical.doctor_ledger drop constraint if exists doctor_ledger_case_id_kind_doctor_id_key;
create unique index if not exists doctor_ledger_once on clinical.doctor_ledger (case_id, kind, doctor_id, ref);
