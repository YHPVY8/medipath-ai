-- Medipath.AI public waitlist table.
-- Public website users may insert early-access requests, but cannot read submissions.
-- This reference SQL matches the current landing-page form fields only.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  city text not null,
  state text not null,
  specialty text,
  whatsapp text,
  launch_consent boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.waitlist_signups
  add column if not exists full_name text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists specialty text,
  add column if not exists whatsapp text,
  add column if not exists launch_consent boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'waitlist_signups'
      and column_name = 'name'
  ) then
    execute $sql$
      update public.waitlist_signups
      set full_name = coalesce(full_name, nullif(btrim(name), ''))
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'waitlist_signups'
      and column_name = 'consent'
  ) then
    execute $sql$
      update public.waitlist_signups
      set launch_consent = coalesce(launch_consent, consent)
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'waitlist_signups'
      and column_name = 'city_state'
  ) then
    execute $sql$
      update public.waitlist_signups
      set
        city = coalesce(city, nullif(btrim(split_part(city_state, '/', 1)), '')),
        state = coalesce(state, nullif(btrim(split_part(city_state, '/', 2)), ''))
    $sql$;
  end if;

end $$;

alter table public.waitlist_signups
  drop constraint if exists waitlist_signups_email_format_check,
  drop constraint if exists waitlist_signups_name_not_blank_check,
  drop constraint if exists waitlist_signups_specialty_not_blank_check,
  drop constraint if exists waitlist_signups_city_state_not_blank_check,
  drop constraint if exists waitlist_signups_consent_required_check,
  drop constraint if exists waitlist_signups_status_check,
  drop constraint if exists waitlist_signups_full_name_not_blank_check,
  drop constraint if exists waitlist_signups_city_not_blank_check,
  drop constraint if exists waitlist_signups_state_not_blank_check,
  drop constraint if exists waitlist_signups_launch_consent_required_check,
  drop constraint if exists waitlist_signups_profile_type_check,
  drop constraint if exists waitlist_signups_communication_preference_check,
  add constraint waitlist_signups_email_format_check
    check (position('@' in email) > 1),
  add constraint waitlist_signups_full_name_not_blank_check
    check (length(btrim(full_name)) > 1),
  add constraint waitlist_signups_city_not_blank_check
    check (length(btrim(city)) > 1),
  add constraint waitlist_signups_state_not_blank_check
    check (length(btrim(state)) > 1),
  add constraint waitlist_signups_launch_consent_required_check
    check (launch_consent is true);

alter table public.waitlist_signups
  alter column full_name set not null,
  alter column email set not null,
  alter column city set not null,
  alter column state set not null,
  alter column launch_consent set not null,
  alter column specialty drop not null;

drop policy if exists "Public can join waitlist" on public.waitlist_signups;

alter table public.waitlist_signups
  drop column if exists name,
  drop column if exists city_state,
  drop column if exists clinic_hospital,
  drop column if exists consent,
  drop column if exists profile_type,
  drop column if exists communication_preference,
  drop column if exists status;

create unique index if not exists waitlist_signups_email_lower_uidx
  on public.waitlist_signups (lower(email));

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

revoke all on table public.waitlist_signups from public, anon, authenticated;
grant insert on table public.waitlist_signups to anon, authenticated;

create policy "Public can join waitlist"
  on public.waitlist_signups
  for insert
  to anon, authenticated
  with check (
    launch_consent is true
    and length(btrim(full_name)) > 1
    and length(btrim(email)) > 3
    and length(btrim(city)) > 1
    and length(btrim(state)) > 1
  );
