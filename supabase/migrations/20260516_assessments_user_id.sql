-- Switch assessments.member_token_id → user_id (FK to auth.users).
-- Pre-launch, so existing rows can be wiped.

truncate table assessments;

alter table assessments
  drop constraint if exists assessments_member_token_id_fkey;

alter table assessments
  drop column member_token_id,
  add column user_id uuid not null references auth.users(id) on delete cascade;

create index if not exists assessments_user_id_idx on assessments(user_id);

-- RLS: replace service-role-only with user-can-read-own + service-role catch-all.
drop policy if exists "service role only" on assessments;

create policy "users read own assessments"
  on assessments for select
  using (auth.uid() = user_id);

create policy "service role full access"
  on assessments for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
