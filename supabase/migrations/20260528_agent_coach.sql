-- Per-user AI coach for paid users: chat history, journey/milestone tracker,
-- daily rate-limit fuse, rolling 90-day access window, and proactive-nudge
-- consent/state. Sits on top of the supabase/db-may-18.md snapshot.
-- Apply via Supabase dashboard SQL editor.

-- 1. Chat thread (one rolling thread per user).
--    request_id is the client idempotency key (see partial unique index below).
--    chunk_ids stores the corpus chunk PKs the answer drew on, for audit — the
--    displayed [n] citation indexes are derived per-answer, not stored here.

create table if not exists agent_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  chunk_ids   int4[] not null default '{}',
  request_id  text,
  created_at  timestamptz not null default now()
);

create index if not exists agent_messages_user_created_idx
  on agent_messages (user_id, created_at);

-- Idempotency guard: a given (user, request_id) can only produce one USER turn.
-- Assistant rows may share the request_id (for replay lookup) without tripping it.
create unique index if not exists agent_messages_user_request_idx
  on agent_messages (user_id, request_id)
  where role = 'user' and request_id is not null;

-- 2. Journey / milestone tracker. milestones is the source of truth; the scalar
--    columns are denormalised on every write so the nudge cron filters on indexed
--    scalars instead of scanning JSONB. last_topic is an <=8-word recap written
--    only from a successful, non-refused assistant turn, so the cron can template
--    a "last time we talked about X" line with zero LLM calls.

create table if not exists user_journey (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  category           text not null,
  milestones         jsonb not null default '[]',
  next_milestone_key text,
  incomplete_count   int4 not null default 0,
  last_topic         text,
  updated_at         timestamptz not null default now()
);

create index if not exists user_journey_incomplete_idx
  on user_journey (incomplete_count);

-- 3. Daily message rate limit (abuse fuse, 30/day). Mirrors demo_rate_limits.

create table if not exists agent_rate_limits (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null default current_date,
  count   int4 not null default 0,
  primary key (user_id, day)
);

-- Atomic check-and-increment. Returns a row even when over the cap (a bare
-- ON CONFLICT ... WHERE count < cap returns NO row at the cap, which the caller
-- would misread as null). allowed=false means the cap was already reached.
create or replace function try_increment_agent_message(p_user_id uuid, p_cap int)
returns table (allowed boolean, count int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  insert into public.agent_rate_limits (user_id, day, count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, day) do update
    set count = public.agent_rate_limits.count + 1
    where public.agent_rate_limits.count < p_cap
  returning public.agent_rate_limits.count into v_count;

  if v_count is null then
    -- Conflict update was skipped (at/over cap). Read the current value.
    select arl.count into v_count
      from public.agent_rate_limits arl
     where arl.user_id = p_user_id and arl.day = current_date;
    return query select false, coalesce(v_count, p_cap);
  else
    return query select true, v_count;
  end if;
end;
$$;

-- Service-role only; never callable by client roles.
revoke all on function try_increment_agent_message(uuid, int) from public, anon, authenticated;
grant execute on function try_increment_agent_message(uuid, int) to service_role;

-- Best-effort refund of one message when an OpenAI/search/parse fault means the
-- user never got an answer — the abuse fuse shouldn't burn a credit on a server
-- error. Floors at 0.
create or replace function refund_agent_message(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.agent_rate_limits
     set count = greatest(count - 1, 0)
   where user_id = p_user_id and day = current_date;
$$;

revoke all on function refund_agent_message(uuid) from public, anon, authenticated;
grant execute on function refund_agent_message(uuid) to service_role;

-- Nudge cron: atomically select AND claim eligible users in one statement, so
-- overlapping runs can't double-send. Filters on the denormalised incomplete_count
-- (indexed scalar, no JSONB scan); orders so the longest-waiting users go first
-- (no starvation); FOR UPDATE SKIP LOCKED + the attempt-claim guard both prevent
-- two concurrent runs picking the same row.
create or replace function claim_nudge_candidates(p_limit int)
returns table (
  user_id            uuid,
  name               text,
  category           text,
  unsub_token        text,
  incomplete_count   int,
  next_milestone_key text,
  last_topic         text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with eligible as (
    select p.user_id
      from public.profiles p
      join public.user_journey j on j.user_id = p.user_id
     where p.tier = 'paid'
       and p.agent_nudge_consent = true
       and p.agent_nudge_unsub_token is not null
       and (p.agent_access_expires_at is null or p.agent_access_expires_at > now())
       and p.agent_last_active_at < now() - interval '7 days'
       and (p.agent_last_nudge_at is null or p.agent_last_nudge_at < now() - interval '7 days')
       and (p.agent_last_nudge_attempt_at is null or p.agent_last_nudge_attempt_at < now() - interval '1 hour')
       and j.incomplete_count > 0
     order by p.agent_last_nudge_at asc nulls first, p.agent_last_active_at asc
     limit p_limit
     for update of p skip locked
  ),
  claimed as (
    update public.profiles p
       set agent_last_nudge_attempt_at = now()
      from eligible e
     where p.user_id = e.user_id
    returning p.user_id, p.name, p.category, p.agent_nudge_unsub_token as unsub_token
  )
  select c.user_id, c.name, c.category, c.unsub_token,
         j.incomplete_count, j.next_milestone_key, j.last_topic
    from claimed c
    join public.user_journey j on j.user_id = c.user_id;
end;
$$;

revoke all on function claim_nudge_candidates(int) from public, anon, authenticated;
grant execute on function claim_nudge_candidates(int) to service_role;

-- 4. profiles: rolling access window + proactive-nudge consent/state.

alter table profiles
  add column if not exists agent_access_expires_at   timestamptz,
  add column if not exists agent_nudge_consent        boolean not null default false,
  add column if not exists agent_nudge_consented_at   timestamptz,
  add column if not exists agent_nudge_unsubscribed_at timestamptz,
  add column if not exists agent_nudge_unsub_token    text,
  add column if not exists agent_last_active_at        timestamptz,
  add column if not exists agent_last_nudge_at         timestamptz,
  add column if not exists agent_last_nudge_attempt_at timestamptz;

-- The unsubscribe token is the link's only credential, so it must be unique.
create unique index if not exists profiles_agent_unsub_token_idx
  on profiles (agent_nudge_unsub_token)
  where agent_nudge_unsub_token is not null;

-- Backfill: existing paid users start with a NULL window. `expires_at > now()`
-- would silently lock them out, so give every current paid user a fresh 90-day
-- window. (The app also treats NULL as eligible and rolls it on first touch, so
-- new-paid races aren't locked out either.)
update profiles
   set agent_access_expires_at = now() + interval '90 days'
 where tier = 'paid'
   and agent_access_expires_at is null;

-- 5. RLS. Users may read only their own chat + journey; ALL writes go through the
--    service-role client (which bypasses RLS), matching the existing tables.
--    agent_rate_limits is never client-readable.

alter table agent_messages   enable row level security;
alter table user_journey     enable row level security;
alter table agent_rate_limits enable row level security;

create policy agent_messages_select_own on agent_messages
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy user_journey_select_own on user_journey
  for select to authenticated
  using (user_id = (select auth.uid()));

-- No policies on agent_rate_limits => no authenticated/anon access at all.
