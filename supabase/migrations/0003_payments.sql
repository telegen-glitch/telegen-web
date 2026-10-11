-- P2 proposal and payment authorisation (CLAUDE.md v5).

-- The Stripe customer that holds the saved card for renewals (an opaque id).
alter table clinical.patients add column if not exists stripe_customer_id text unique;

-- When the card authorisation lapses if not captured (from the card network, via Stripe).
alter table clinical.payments add column if not exists capture_before timestamptz;
alter table clinical.payments add column if not exists proposal_id uuid references clinical.proposals (id);

-- A patient's A/B price variant stays the same across their cases (assigned server-side, 50/50).
create table if not exists clinical.price_assignments (
  patient_id uuid primary key references clinical.patients (id) on delete cascade,
  variant text not null check (variant in ('A', 'B')),
  assigned_at timestamptz not null default now()
);
alter table clinical.price_assignments enable row level security;
create policy price_assignments_admin on clinical.price_assignments for select to authenticated using (clinical.is_admin());
grant all on clinical.price_assignments to service_role;
grant select on clinical.price_assignments to authenticated;

insert into clinical_meta.migrations (name) values ('0003_payments.sql') on conflict do nothing;
