-- P3 doctor workflow (CLAUDE.md v5).

-- The flat review fee is an owner decision: entries are recorded now, the amount is applied at export.
alter table clinical.doctor_ledger alter column fee drop not null;

-- Which proposal the doctor approved or proposed instead; when the patient answered an adjustment.
alter table clinical.cases add column if not exists approved_proposal_id uuid references clinical.proposals (id);

-- Doctors read the messages of cases they see; the patient's unread count.
create index if not exists messages_unread on clinical.messages (case_id) where read_at is null;

-- The doctor's own instructions for each item of an adjusted plan (used for the prescription once the
-- patient accepts). Health data: visible to the patient and the doctor on the case, never to admins.
alter table clinical.proposals add column if not exists instructions jsonb;

insert into clinical_meta.migrations (name) values ('0004_doctor.sql') on conflict do nothing;
