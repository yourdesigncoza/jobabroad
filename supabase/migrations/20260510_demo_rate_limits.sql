-- Per-IP daily rate limits for /demo/[category] traffic.
-- ip_hash is sha256(secret + ip) so we never store raw client IPs.

create table if not exists public.demo_rate_limits (
  ip_hash text not null,
  day date not null,
  search_count int not null default 0,
  wiki_count int not null default 0,
  primary key (ip_hash, day)
);

create index if not exists demo_rate_limits_day_idx
  on public.demo_rate_limits (day);

create or replace function public.increment_demo_limit(
  p_ip_hash text,
  p_action  text,
  p_limit   int
)
returns table (used int, allowed boolean)
language plpgsql
as $$
declare
  v_count int;
begin
  insert into public.demo_rate_limits (ip_hash, day)
    values (p_ip_hash, current_date)
    on conflict (ip_hash, day) do nothing;

  if p_action = 'search' then
    select search_count
      into v_count
      from public.demo_rate_limits
     where ip_hash = p_ip_hash
       and day = current_date
     for update;

    if v_count >= p_limit then
      return query select v_count, false;
      return;
    end if;

    update public.demo_rate_limits
       set search_count = search_count + 1
     where ip_hash = p_ip_hash
       and day = current_date
     returning search_count into v_count;

  elsif p_action = 'wiki' then
    select wiki_count
      into v_count
      from public.demo_rate_limits
     where ip_hash = p_ip_hash
       and day = current_date
     for update;

    if v_count >= p_limit then
      return query select v_count, false;
      return;
    end if;

    update public.demo_rate_limits
       set wiki_count = wiki_count + 1
     where ip_hash = p_ip_hash
       and day = current_date
     returning wiki_count into v_count;

  else
    raise exception 'invalid action: %', p_action;
  end if;

  return query select v_count, true;
end;
$$;
