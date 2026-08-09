-- Medipath.AI Phase 1 waitlist table.
-- Public website users may insert lead requests, but cannot read submissions.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  specialty text not null,
  city_state text not null,
  clinic_hospital text,
  whatsapp text,
  consent boolean not null default false,
  status text not null default 'New',
  created_at timestamptz not null default now(),
  constraint waitlist_signups_email_format_check
    check (position('@' in email) > 1),
  constraint waitlist_signups_name_not_blank_check
    check (length(btrim(name)) > 1),
  constraint waitlist_signups_specialty_not_blank_check
    check (length(btrim(specialty)) > 1),
  constraint waitlist_signups_city_state_not_blank_check
    check (length(btrim(city_state)) > 1),
  constraint waitlist_signups_consent_required_check
    check (consent is true),
  constraint waitlist_signups_status_check
    check (status in ('New', 'Contacted', 'Invited', 'Pilot User', 'Converted'))
);

create unique index if not exists waitlist_signups_email_lower_uidx
  on public.waitlist_signups (lower(email));

create index if not exists waitlist_signups_status_created_at_idx
  on public.waitlist_signups (status, created_at desc);

alter table public.waitlist_signups enable row level security;

revoke all on table public.waitlist_signups from public, anon, authenticated;
grant insert on table public.waitlist_signups to anon, authenticated;

drop policy if exists "Public can join waitlist" on public.waitlist_signups;
create policy "Public can join waitlist"
  on public.waitlist_signups
  for insert
  to anon, authenticated
  with check (
    consent is true
    and status = 'New'
    and length(btrim(name)) > 1
    and length(btrim(email)) > 3
    and length(btrim(specialty)) > 1
    and length(btrim(city_state)) > 1
  );
