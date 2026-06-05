-- Open proactive nudges to free-tier prospects (lead-gen mode).
--
-- The original claim_nudge_candidates hard-filtered tier='paid', which excluded
-- the entire free base. With the payment gate off, that base IS the prospect
-- list, so the daily nudge cron was effectively emailing nobody. This adds a
-- p_include_free flag; the cron passes !PAYMENTS_ENABLED, so the claim auto-
-- reverts to paid-only if the R495 gate is ever switched back on.
--
-- Adding a parameter changes the signature, so the old 1-arg overload must be
-- dropped first (create-or-replace would leave an ambiguous overload).

drop function if exists claim_nudge_candidates(int);

create or replace function claim_nudge_candidates(
  p_limit int,
  p_include_free boolean default false
)
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
     where (p.tier = 'paid' or (p_include_free and p.tier = 'free'))
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

revoke all on function claim_nudge_candidates(int, boolean) from public, anon, authenticated;
grant execute on function claim_nudge_candidates(int, boolean) to service_role;
