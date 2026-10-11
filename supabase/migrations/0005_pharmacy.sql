-- P4 pharmacy, payment split and invoices (CLAUDE.md v5).

-- Pharmacies reach prescriptions and delivery addresses only with two-factor authentication too.
create or replace function clinical.my_pharmacy_id() returns uuid
language sql stable security definer set search_path = clinical, pg_temp as $$
  select m.pharmacy_id from clinical.pharmacy_members m join clinical.profiles p on p.id = m.profile_id
  where m.profile_id = auth.uid() and p.role = 'pharmacy' and coalesce(clinical.jwt_claim('aal'), '') = 'aal2'
$$;

-- The pharmacy's share of a captured payment (Stripe Connect transfer).
alter table clinical.orders add column if not exists transfer_id text;
alter table clinical.orders add column if not exists transfer_amount int;

-- The order list shows TEST orders as such; still no condition, answers or photos.
create or replace view clinical.pharmacy_orders as
  select o.id, o.status, o.carrier, o.tracking_code, o.created_at, o.shipped_at, o.delivered_at,
         p.items as prescription_items, p.issued_at as prescribed_at,
         d.full_name as doctor_name, d.parafa_code as doctor_parafa,
         pt.full_name as ship_name, pt.phone as ship_phone, pt.address_line as ship_address,
         pt.city as ship_city, pt.county as ship_county, pt.postal_code as ship_postal_code,
         c.test
  from clinical.orders o
  join clinical.prescriptions p on p.id = o.prescription_id
  join clinical.doctors d on d.id = p.doctor_id
  join clinical.cases c on c.id = o.case_id
  join clinical.patients pt on pt.id = c.patient_id
  where o.pharmacy_id = clinical.my_pharmacy_id();
grant select on clinical.pharmacy_orders to authenticated;

-- Invoices for the service (SmartBill or Oblio, through an adapter). The item is "Plan Telegen".
create table if not exists clinical.invoices (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references clinical.cases (id) on delete cascade,
  payment_id uuid not null unique references clinical.payments (id),
  amount int not null check (amount > 0),
  provider text,
  status text not null default 'pending' check (status in ('pending', 'issued', 'failed')),
  number text,
  issued_at timestamptz,
  created_at timestamptz not null default now()
);
alter table clinical.invoices enable row level security;
create policy invoices_patient on clinical.invoices for select to authenticated using (clinical.owns_case(case_id));
create policy invoices_admin on clinical.invoices for select to authenticated using (clinical.is_admin());
grant select on clinical.invoices to authenticated;
grant all on clinical.invoices to service_role;

insert into clinical_meta.migrations (name) values ('0005_pharmacy.sql') on conflict do nothing;
