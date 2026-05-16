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
