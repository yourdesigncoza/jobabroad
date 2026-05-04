create table assessments (
  id                    uuid primary key default gen_random_uuid(),
  member_token_id       uuid not null references member_tokens(id),
  category              text not null,
  schema_version        int not null default 1,
  completed_step_slugs  text[] not null default '{}',
  status                text not null default 'draft',
  data                  jsonb not null default '{}',
  submitted_at          timestamptz,
  updated_at            timestamptz not null default now()
);

alter table assessments enable row level security;

create policy "service role only" on assessments
  using (auth.role() = 'service_role');

create extension if not exists moddatetime;

create trigger set_updated_at
  before update on assessments
  for each row execute function moddatetime(updated_at);
