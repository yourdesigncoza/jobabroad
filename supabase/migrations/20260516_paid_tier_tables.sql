-- Paid tier schema: profiles columns + bookings + paid_reports + storage bucket + credit fns.
-- Apply via Supabase dashboard SQL editor.

-- 1. Profiles: tier, follow-up credits, payment idempotency ref.

alter table profiles
  add column tier text not null default 'free'
    check (tier in ('free', 'paid'));

alter table profiles
  add column paid_email_credits int not null default 0
    check (paid_email_credits >= 0);

alter table profiles
  add column last_payment_ref text;

-- 2. Bookings: one row per Cal.com booking, gated by POPIA consent.

create table bookings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  slot_at      timestamptz,
  consented_at timestamptz not null,
  external_ref text,
  created_at   timestamptz not null default now()
);

create index bookings_user_id_idx on bookings(user_id);

alter table bookings enable row level security;

create policy "users read own bookings"
  on bookings for select
  using (auth.uid() = user_id);

create policy "service role full access bookings"
  on bookings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- 3. Paid reports: one cached PDF per user.

create table paid_reports (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  pdf_path     text not null,
  generated_at timestamptz not null default now()
);

alter table paid_reports enable row level security;

create policy "users read own report row"
  on paid_reports for select
  using (auth.uid() = user_id);

create policy "service role full access paid_reports"
  on paid_reports for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- 4. Storage: private bucket for PDFs + defense-in-depth RLS on storage.objects.

insert into storage.buckets (id, name, public)
values ('paid-reports', 'paid-reports', false)
on conflict (id) do nothing;

create policy "users read own paid report objects"
  on storage.objects for select
  using (
    bucket_id = 'paid-reports'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "service role manages paid report objects"
  on storage.objects for all
  using (auth.role() = 'service_role' and bucket_id = 'paid-reports')
  with check (auth.role() = 'service_role' and bucket_id = 'paid-reports');

-- 5. Credit helper functions for step 11 (follow-up emails).
-- decrement: atomic, only succeeds if credits > 0; returns remaining count.
-- increment: best-effort rollback on send failure.

create or replace function public.decrement_email_credit(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining int;
begin
  update profiles
     set paid_email_credits = paid_email_credits - 1
   where user_id = p_user_id
     and paid_email_credits > 0
  returning paid_email_credits into v_remaining;

  if v_remaining is null then
    raise exception 'no_credits_remaining';
  end if;

  return v_remaining;
end;
$$;

create or replace function public.increment_email_credit(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining int;
begin
  update profiles
     set paid_email_credits = paid_email_credits + 1
   where user_id = p_user_id
  returning paid_email_credits into v_remaining;

  return v_remaining;
end;
$$;

revoke all on function public.decrement_email_credit(uuid) from public, anon, authenticated;
revoke all on function public.increment_email_credit(uuid) from public, anon, authenticated;
grant execute on function public.decrement_email_credit(uuid) to service_role;
grant execute on function public.increment_email_credit(uuid) to service_role;
