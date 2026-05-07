# Semantic Search — Operating Notes

Search lives on `/members/[token]` and indexes the pathway guide + the `wiki-builds/work-abroad-web/wa-*` corpus into Supabase pgvector. Embeddings: `gte-small` (384-dim, free, runs in a Supabase Edge Function for queries and locally via `@xenova/transformers` for indexing).

## When to re-run the index

Run reindex whenever any of these change:

- A pathway guide markdown (`content/pathways/<category>.md`)
- Any wiki note in `/home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-*/wiki/`
- The reindex script itself (chunking logic, frontmatter handling)

### Two modes

**Full rebuild** — `npm run reindex`
Wipes `pathway_chunks` and re-embeds every chunk for every category. Use after changes to the script itself, after editing shared vaults (`wa-shared-*`), or whenever you want a clean rebuild. Embeds ~3,000+ chunks (~1–3 min).

**Partial rebuild** — `npm run reindex -- --category=<name>`
Wipes only rows where `category='<name>'` and re-embeds only that category's chunks (guide + the 6 vaults that map to it). Use after publishing one new category, or after editing one category's pathway guide or vaults. Valid `<name>` values match the `category` column in the DB: `healthcare`, `teaching`, `seasonal`, `trades`, `farming`, `shared`. ~5× faster than the full rebuild.

The full mode is the safe default. Reach for partial when you know nothing else changed.

## Publish-pathway process flow (adding a new category)

**Categories live so far:** healthcare, teaching, seasonal, trades, farming.
**Remaining:** engineering, IT/tech, accounting, hospitality.

Run through these steps in order each time you publish a new category. Each step is mechanical — the goal is that nothing required to make the category fully operational is missed.

### 1. Build the content

```bash
/build-pathway <category>
```

This produces:
- `content/pathways/<category>.md` — the buyer-facing guide
- `wiki-builds/work-abroad-web/wa-<vault-prefix>-{01..06}-*/` — the supporting vaults

The **vault prefix** does not always match the category name. Current mappings:

| `interest_category` (DB) | Vault prefix (filesystem) |
|---|---|
| `healthcare` | `wa-nursing-*` |
| `teaching`   | `wa-teaching-*` |
| `seasonal`   | `wa-seasonal-*` |
| `trades`     | `wa-trades-*` |
| `farming`    | `wa-farming-*` |
| (any)        | `wa-shared-*` — applied to all |

### 2. Add the eligibility assessment

Create `lib/assessments/steps/<category>.ts` exporting `<CATEGORY>_STEPS: StepDef[]` (mirror the structure in `farming.ts` / `seasonal.ts`), then register it in `lib/assessments/steps/index.ts`:

```ts
import { FARMING_STEPS } from './farming';
const REGISTRY: Record<string, StepDef[]> = {
  // …
  farming: FARMING_STEPS,
};
```

Without this, `/members/[token]` shows no Assessment CTA for the new category and the buyer flow degrades silently.

### 3. Wire the new category into the reindex script

Two edits in `scripts/reindex.ts`:

- Add `<vault-prefix>: '<category>'` to the `VAULT_TO_CATEGORY` map
- Add the new vault prefix to the regex literal that matches `wa-<prefix>-` (the line just below `for (const vault of vaults)` — currently lists `nursing|teaching|seasonal|trades|farming|shared`)

The pathway guide is picked up automatically — its filename becomes the category (`content/pathways/engineering.md` → `category='engineering'`).

### 4. Re-index

```bash
set -a; source .env.local; set +a   # the script reads SUPABASE env from here
npm run reindex -- --category=<category>
```

Use `--category=<category>` for the partial reindex — only the new category's rows are wiped and re-embedded, ~5× faster than the full mode. Switch to `npm run reindex` (no flag) if you also edited `wa-shared-*` vaults or anything else outside the new category.

Confirm the per-vault counts at the top of the output. Expect `guide <category>: NN chunks` and 6 × `wiki wa-<prefix>-* -> <category>: NN chunks` lines.

### 5. Generate a test token + record the URL

```bash
curl -s -u admin:$ADMIN_SECRET \
  -X POST -H "Content-Type: application/json" \
  -d '{"phone":"27617114715","category":"<category>"}' \
  http://localhost:3000/api/admin/generate-token
```

Then add the token to `.env.local` (under the `# Test tokens` block, alongside `TEST_TOKEN_HEALTHCARE` etc.) and to the `Test tokens (local dev)` list inside `CLAUDE.md`. This keeps Playwright tests and future debugging sessions self-serve.

### 6. Verify in browser

Open `http://localhost:3000/members/<test-token>` and confirm:
- Pathway content renders with TOC sidebar
- Assessment CTA appears (proves Step 2 worked)
- Search box returns results for category-specific terms (proves Steps 3–4 worked)

### 7. Commit + push

Two commits work well — one for the assessment and system changes, one for the guide and pipeline output. Match the existing commit-style: `feat(assessment): add <category> eligibility wizard` and `feat(<category>): publish full pathway guide with 6 sections`. The reindex itself is a runtime side-effect — no commit needed for the index update, only for the script edits in Step 3.

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
