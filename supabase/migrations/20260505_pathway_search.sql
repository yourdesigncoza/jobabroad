create extension if not exists vector with schema extensions;

create table pathway_chunks (
  id           bigint primary key generated always as identity,
  category     text not null,
  source_type  text not null check (source_type in ('guide', 'wiki')),
  source_path  text not null,
  heading      text not null,
  anchor       text,
  slug         text,
  content      text not null,
  embedding    extensions.vector(384) not null,
  created_at   timestamptz not null default now()
);

create index pathway_chunks_embedding_idx on pathway_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

create index pathway_chunks_category_idx on pathway_chunks (category);

alter table pathway_chunks enable row level security;

create policy "service role only" on pathway_chunks
  using (auth.role() = 'service_role');

create or replace function match_pathway_chunks(
  query_embedding extensions.vector(384),
  filter_category text,
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  id bigint,
  category text,
  source_type text,
  source_path text,
  heading text,
  anchor text,
  slug text,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    pc.id,
    pc.category,
    pc.source_type,
    pc.source_path,
    pc.heading,
    pc.anchor,
    pc.slug,
    pc.content,
    1 - (pc.embedding <=> query_embedding) as similarity
  from pathway_chunks pc
  where (pc.category = filter_category or pc.category = 'shared')
    and pc.embedding <=> query_embedding < 1 - match_threshold
  order by pc.embedding <=> query_embedding asc
  limit least(match_count, 50);
$$;
