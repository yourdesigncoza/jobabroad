---
step: 13
title: Drop legacy tables migration (member_tokens, leads)
status: done
depends-on: [12]
module: db
---

# Step 13 — Drop legacy onboarding tables

## Objective

Migration that drops `member_tokens`, `leads`, and the orphaned `cv_submissions` table (CV service was dropped 2026-05-15 per memory `project_cv_service_dropped`). Run AFTER Step 12 deletes the code that referenced them.

## Architecture context

- Existing tables to drop:
  - `member_tokens` — FK → `leads(id)`
  - `leads` — referenced by `member_tokens` and `cv_submissions`
  - `cv_submissions` — orphaned (CV service dropped 2026-05-15)
- Drop order matters: dependents first, then dependencies. With `cascade`, order is forgiving — use `if exists` for safety.
- Naming convention: `YYYYMMDD_short_name.sql`.

## Files to create

### `supabase/migrations/20260516_drop_legacy_onboarding.sql`

```sql
-- Drop legacy onboarding tables.
-- member_tokens: superseded by Supabase Auth (auth.users + profiles).
-- leads: same.
-- cv_submissions: CV service dropped 2026-05-15 (see memory: project_cv_service_dropped).

drop table if exists member_tokens cascade;
drop table if exists cv_submissions cascade;
drop table if exists leads cascade;
```

## Files to modify

None.

## Pattern context

- `if exists` + `cascade` for safe re-runs. Standard Supabase migration pattern.
- The old `supabase/schema.sql` file still contains these tables — leave it untouched (it's no longer the source of truth; migrations are).

## Risk context

- **Irreversible.** Once dropped, data is gone. Confirm with the user before applying to production. Pre-launch, no real users — safe.
- If any external integration (Vercel logs, analytics, internal scripts) reads these tables, it will break silently. Grep external scripts in `scripts/` for table references:
  ```bash
  grep -rn 'member_tokens\|leads\|cv_submissions' scripts/ docs/ --include='*.ts' --include='*.sh'
  ```
  Update or remove anything found before applying.
- The migration removes RLS policies and triggers attached to these tables automatically via `cascade`. No manual cleanup needed.

## Applying

```bash
# Local
npx supabase migration up

# Remote
npx supabase db push
```

## Gemini-noted considerations

- DB schema change is a separate step from code (Gemini agreed, skill rule).

## Done when

- File `supabase/migrations/20260516_drop_legacy_onboarding.sql` exists.
- Applied to local + remote Supabase. Verify:
  ```sql
  select table_name from information_schema.tables
   where table_schema = 'public'
     and table_name in ('member_tokens', 'leads', 'cv_submissions');
  -- Should return 0 rows.
  ```
- `select table_name from information_schema.tables where table_schema = 'public' order by table_name;` shows: `profiles`, `assessments`, `pathway_chunks`, `demo_rate_limits`, and nothing else from the legacy set.
- No code or scripts reference the dropped tables.
