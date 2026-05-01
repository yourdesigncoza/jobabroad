-- People who contacted via WhatsApp
create table leads (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  interest_category text not null,
  created_at timestamptz default now()
);

-- Unique member links (generated after PayShap payment confirmed)
create table member_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null default gen_random_uuid()::text,
  lead_id uuid references leads(id),
  interest_category text not null,
  created_at timestamptz default now(),
  accessed_at timestamptz
);

-- CV uploads
create table cv_submissions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  type text check (type in ('upload', 'built')) not null,
  storage_path text,
  created_at timestamptz default now()
);
