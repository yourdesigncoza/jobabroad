---
step: 01
title: DB migration — profiles.tier + paid_email_credits, bookings + paid_reports tables
status: ready
depends: []
plan: r495-paid-tier
---

# Step 01: DB migration

## Objective

Schema foundation for the paid tier. Adds two columns to `profiles` plus
two new tables (`bookings`, `paid_reports`). User applies via Supabase
dashboard SQL editor (no local Docker).

## Context

### Architecture

Profiles is the existing per-user row created by the `handle_new_user`
trigger from `auth.users` metadata. Adding `tier` and
`paid_email_credits` lets RLS + UI gate paid features. `bookings` records
each Cal.com booking with a POPIA consent timestamp (required). 
`paid_reports` caches one generated PDF per user (regen if missing or
explicitly invalidated).

### Database

Existing `profiles` (from `20260516_profiles_and_auth.sql`):
```
user_id     uuid PK → auth.users(id) CASCADE
name        text NOT NULL
phone       text NOT NULL UNIQUE  CHECK '^27\d{9}$'
category    text NOT NULL CHECK (one of 11 categories)
created_at  timestamptz default now()
```

Add:
```
tier                  text not null default 'free' check (tier in ('free','paid'))
paid_email_credits    int  not null default 0      check (paid_email_credits >= 0)
last_payment_ref      text                                          -- nullable; webhook idempotency (see step 07)
```

New tables:
```sql
create table bookings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  slot_at       timestamptz,                 -- nullable until Cal.com webhook confirms
  consented_at  timestamptz not null,        -- POPIA recording consent
  external_ref  text,                        -- Cal.com booking id (nullable)
  created_at    timestamptz not null default now()
);

create index bookings_user_id_idx on bookings(user_id);

alter table bookings enable row level security;
create policy "users read own bookings" on bookings for select using (auth.uid() = user_id);
create policy "service role full access" on bookings for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create table paid_reports (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  pdf_path     text not null,                -- Supabase Storage object path
  generated_at timestamptz not null default now()
);

alter table paid_reports enable row level security;
create policy "users read own report row" on paid_reports for select using (auth.uid() = user_id);
create policy "service role full access" on paid_reports for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
```

Also create a private Supabase Storage bucket `paid-reports` plus a defense-in-depth RLS policy on `storage.objects`:
```sql
insert into storage.buckets (id, name, public) values ('paid-reports','paid-reports', false)
on conflict (id) do nothing;

-- Defense-in-depth: even if a signed URL is generated for the wrong user,
-- direct storage.objects access requires the path's first folder to match auth.uid().
create policy "users read own paid report objects"
  on storage.objects for select
  using (bucket_id = 'paid-reports' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "service role manages paid report objects"
  on storage.objects for all
  using (auth.role() = 'service_role' and bucket_id = 'paid-reports')
  with check (auth.role() = 'service_role' and bucket_id = 'paid-reports');
```

### Existing Patterns

Migrations live in `supabase/migrations/YYYYMMDD_short_name.sql`. User
applies via dashboard SQL editor (no Docker). RLS uses `auth.uid()` for
read-own + service-role-full-access pattern (matches existing assessments
RLS).

### Risk

- **R5:** `bookings.consented_at` is NOT NULL — no booking without
  consent. Enforced at DB level so app-layer bugs can't bypass.
- Re-running migration would fail at `create table`; that's the standard
  Supabase migration assumption. `if not exists` on bucket insert.

## Implementation

1. Write `supabase/migrations/20260516_paid_tier_tables.sql` with:
   - `alter table profiles add column tier ...`
   - `alter table profiles add column paid_email_credits ...`
   - `alter table profiles add column last_payment_ref ...` (idempotency for step 07)
   - `create table bookings ...` with RLS + policies
   - `create table paid_reports ...` with RLS + policies
   - `insert into storage.buckets ...` for `paid-reports`
   - `create policy ...` on `storage.objects` for the `paid-reports` bucket (defense-in-depth)
   - `create function decrement_email_credit(uuid)` and `increment_email_credit(uuid)` (used in step 11; declared here so the migration is atomic)

2. Print instructions for the user to apply via Supabase dashboard SQL
   editor (link to https://supabase.com/dashboard/project/hwqlvrabuhcottyzaaff/sql/new).

3. Verify block to run after migration:
   ```sql
   select column_name from information_schema.columns
    where table_schema='public' and table_name='profiles'
      and column_name in ('tier','paid_email_credits','last_payment_ref');
   -- should return 3 rows

   select table_name from information_schema.tables
    where table_schema='public' and table_name in ('bookings','paid_reports');
   -- should return 2 rows

   select id from storage.buckets where id = 'paid-reports';
   -- should return 1 row

   select proname from pg_proc
    where proname in ('decrement_email_credit','increment_email_credit','handle_new_user');
   -- should include all 3
   ```

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| create | `supabase/migrations/20260516_paid_tier_tables.sql` | Schema changes for paid tier |

## Done When

1. Migration file exists with the SQL above.
2. User has applied it via Supabase SQL editor; verify block returns expected rows.
3. Storage bucket `paid-reports` exists and is private (NOT public).

## Gotchas

- Don't make the bucket public. PDFs contain personalised reports; serve only via signed URLs.
- `tier` must accept `'paid'` for upgrade flow — check the CHECK constraint allows it.
