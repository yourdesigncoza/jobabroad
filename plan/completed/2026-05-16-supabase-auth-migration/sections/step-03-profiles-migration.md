---
step: 03
title: Profiles migration + handle_new_user trigger + RLS
status: done
depends-on: []
module: db
---

# Step 03 — Profiles migration + trigger + RLS

## Objective

Create the `profiles` table with FK to `auth.users`, UNIQUE constraint on phone, RLS allowing each user to read/update their own row, and a `SECURITY DEFINER` trigger `handle_new_user()` that populates the profile on `auth.users` insert from `raw_user_meta_data`.

## Architecture context

- Existing migrations directory: `supabase/migrations/`.
- Naming convention: `YYYYMMDD_short_name.sql` (e.g. `20260504_assessments.sql`, `20260510_demo_rate_limits.sql`).
- Existing tables: `leads`, `member_tokens`, `cv_submissions`, plus assessments and demo_rate_limits from later migrations.
- 11 categories in `lib/categories.ts`. The CHECK constraint enumerates them.

## Files to create

### `supabase/migrations/20260516_profiles_and_auth.sql`

```sql
-- Profiles for Supabase Auth users.
-- One row per auth.users row, created automatically by the handle_new_user trigger.

create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  phone text not null unique check (phone ~ '^27\d{9}$'),
  category text not null check (category in (
    'engineering', 'it-tech', 'teaching', 'accounting', 'farming',
    'healthcare', 'seasonal', 'hospitality', 'trades', 'tefl', 'au-pair'
  )),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "users read own profile"
  on profiles for select
  using (auth.uid() = user_id);

create policy "users update own profile name/phone (not category)"
  on profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- Note: category mutability is enforced at the app layer (Step 04+11 do not expose
-- a category-edit UI). To enforce in DB, add a row-level trigger blocking
-- category changes — deferred to keep this migration minimal.

-- Trigger: create profiles row on auth.users insert from raw_user_meta_data.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := nullif(trim(coalesce(new.raw_user_meta_data->>'name', '')), '');
  v_phone text := nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '');
  v_category text := nullif(trim(coalesce(new.raw_user_meta_data->>'category', '')), '');
begin
  if v_name is null or v_phone is null or v_category is null then
    raise exception 'handle_new_user: missing required metadata (name=%, phone=%, category=%)',
      v_name, v_phone, v_category;
  end if;

  insert into public.profiles (user_id, name, phone, category)
  values (new.id, v_name, v_phone, v_category);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Files to modify

None in code. `supabase/schema.sql` is stale (only contains the original three tables); leave it untouched — it's no longer authoritative.

## Pattern context

- `SECURITY DEFINER` runs the function with the owner's privileges (postgres), bypassing RLS for the insert into `profiles`. This is the Supabase-recommended pattern.
- `set search_path = public` prevents search-path hijacking (critical for SECURITY DEFINER).
- `on delete cascade` on the FK so deleting an `auth.users` row removes the profile.
- `nullif(trim(coalesce(..., '')), '')` handles missing keys, empty strings, and whitespace-only values uniformly.

## Risk context

- **R1 (race):** If the trigger fails (e.g. `raise exception` fires), the user insert is rolled back — `supabase.auth.signUp` returns an error and the Step 04 form surfaces it. Good.
- **R2 (silent NULLs):** The explicit `raise exception` is the mitigation. Do not change it to `coalesce(..., 'unknown')`.
- **R6 (phone UNIQUE):** Accepted constraint — household-sharing rare for this market.
- Trigger is created OR REPLACE-safe but the table is not — running this migration twice will fail at `create table`. Standard Supabase migration assumption: applied exactly once.

## Gemini-noted considerations

- `SECURITY DEFINER` + `set search_path` is the recommended pattern (Gemini agreed).
- Phone UNIQUE constraint is mandatory (Gemini flagged its absence as a blind spot).
- The trigger keeps logic atomic with the user creation — better than calling from the server action.

## Applying the migration

```bash
# Local Supabase
npx supabase db reset    # full reset (dev only)
# OR
npx supabase migration up   # apply pending

# Remote
npx supabase db push
```

If `npx supabase` isn't set up locally, apply via the Supabase dashboard SQL editor.

## Done when

- File `supabase/migrations/20260516_profiles_and_auth.sql` exists.
- Applied to the project's Supabase instance (`profiles` table queryable, trigger fires on test insert into `auth.users` via dashboard).
- Test signUp from psql or dashboard:
  ```sql
  -- Should fail: missing metadata
  insert into auth.users (id, email, raw_user_meta_data) values
    (gen_random_uuid(), 'test1@example.com', '{}');

  -- Should succeed: full metadata
  insert into auth.users (id, email, raw_user_meta_data) values
    (gen_random_uuid(), 'test2@example.com',
     '{"name":"Test","phone":"27617114715","category":"healthcare"}');

  -- Verify profile row exists
  select * from profiles where phone = '27617114715';

  -- Cleanup
  delete from auth.users where email in ('test1@example.com','test2@example.com');
  ```
