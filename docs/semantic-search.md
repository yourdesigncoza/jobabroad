# Semantic Search — Operating Notes

Search lives on `/members/[token]` and indexes the pathway guide + the `wiki-builds/work-abroad-web/wa-*` corpus into Supabase pgvector. Embeddings: `gte-small` (384-dim, free, runs in a Supabase Edge Function for queries and locally via `@xenova/transformers` for indexing).

## When to re-run the index

Run `npm run reindex` whenever any of these change:

- A pathway guide markdown (`content/pathways/<category>.md`)
- Any wiki note in `/home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-*/wiki/`
- The reindex script itself (chunking logic, frontmatter handling)

The script wipes `pathway_chunks` and rebuilds from scratch — safe to re-run as often as needed.

## Adding a new category (e.g. engineering, IT/tech, accounting, farming, hospitality, trades)

### 1. Build the content

```bash
/build-pathway <category>
```

This produces:
- `content/pathways/<category>.md` — the buyer-facing guide
- `wiki-builds/work-abroad-web/wa-<vault-prefix>-{01..06}-*/` — the supporting vaults

Note the **vault prefix** the build-pathway pipeline uses. It does not always match the category name. Existing mappings:

| `interest_category` (DB)   | Vault prefix (filesystem)       |
|----------------------------|---------------------------------|
| `healthcare`               | `wa-nursing-*`                  |
| `teaching`                 | `wa-teaching-*`                 |
| `seasonal`                 | `wa-seasonal-*`                 |
| (any)                      | `wa-shared-*` — applied to all  |

### 2. Wire the new category into the reindex script

Edit `scripts/reindex.ts` in two places — the regex and the map. Example for engineering, assuming `wa-engineering-*` vaults:

```ts
const VAULT_TO_CATEGORY: Record<string, string> = {
  nursing: 'healthcare',
  teaching: 'teaching',
  seasonal: 'seasonal',
  shared: 'shared',
  engineering: 'engineering',
};

const m = /^wa-(nursing|teaching|seasonal|shared|engineering)-/.exec(vault);
```

The pathway guide is picked up automatically — its filename becomes the category (`content/pathways/engineering.md` → `category='engineering'`).

### 3. Re-index

```bash
npm run reindex
```

Confirm the per-vault counts at the top of the output, then verify in the browser with a token whose `interest_category` matches the new category.

### 4. Make sure the DB has matching tokens

Members must have `member_tokens.interest_category = '<category>'` for search to scope to that category. New tokens are created via `/admin` — make sure the admin form accepts the new category, or insert directly via SQL/dashboard for testing.

## Verifying the index

In the Supabase SQL editor:

```sql
select category, source_type, count(*)
from pathway_chunks
group by 1, 2
order by 1, 2;
```

Expected shape (current numbers will drift):

```
healthcare | guide | 45
healthcare | wiki  | 472
seasonal   | guide | 55
seasonal   | wiki  | 349
shared     | wiki  | 423
teaching   | guide | 68
teaching   | wiki  | 415
```

What matters: **every category has both `guide` and `wiki` rows**, and `shared` exists.

## Search infrastructure (one-time setup, already done)

If setting up a fresh Supabase project, these are required once:

1. **Migration** — apply `supabase/migrations/20260505_pathway_search.sql` via SQL editor or `supabase db push`. Creates `pathway_chunks` table, HNSW cosine index, and `match_pathway_chunks` RPC.
2. **Edge Function** — deploy with JWT verification disabled (the function checks an internal shared-secret header instead, because new `sb_secret_*` keys aren't accepted as JWTs by the function gateway):
   ```bash
   npx supabase functions deploy search-pathway
   ```
   (`supabase/config.toml` already has `verify_jwt = false` for this function.)
3. **Env vars** — `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. The reindex script reads them from there.

## Troubleshooting

| Symptom                                 | Likely cause                                                            |
|-----------------------------------------|-------------------------------------------------------------------------|
| 502 from `/api/search`                  | Edge Function not deployed, or `x-internal-key` mismatch                |
| Always 0 results                        | Token's `interest_category` doesn't match any rows in `pathway_chunks`  |
| Wrong category leaking in               | SQL filter inside `match_pathway_chunks` was edited — should be `category = filter_category OR category = 'shared'` |
| Wiki note panel shows raw markdown      | `lib/render-wiki.ts` not running — check `/api/wiki/[id]` returns `html` |
| `[[wikilinks]]` rendered literally      | Regex in `lib/render-wiki.ts` or `scripts/reindex.ts` missed a variant   |
| Reindex crashes on a wiki note          | Bad YAML frontmatter (duplicate keys). Script logs a warning and continues with whole-file body — fix the source note when convenient |
| `gte-small` model download stalls       | First run downloads ~30MB to `~/.cache/huggingface`. Re-run; subsequent runs are instant |

## Tuning knobs

- **Threshold** — `0.5` cosine similarity by default in the SQL function. Lower for more recall, raise for fewer false positives.
- **Chunk size** — `MAX_CHARS = 1800` in `scripts/reindex.ts` (~450 tokens for gte-small, well under its 512 limit). Larger chunks = better context per result, fewer chunks total. Smaller = more granular matches.
- **Result count** — 10 by default in the Edge Function. Increase if the UI feels thin.
- **Guide-first ordering** — `app/api/search/route.ts` sorts guide results above wiki results post-RPC. Remove that sort if you want pure cosine ranking.
