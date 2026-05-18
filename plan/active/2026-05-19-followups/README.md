# Follow-ups from the paid-flow refactor session

**Raised:** 2026-05-18 at the end of the Phase 1-4 ship
**Pick up:** 2026-05-19

Three loose threads carried over from the paid-flow refactor. None are blockers; pick whichever bites first.

## 1. Pre-existing working-tree state to triage

When I opened the repo on 2026-05-18 these were already uncommitted, untouched by my session:

```
 M lib/auth-guards.ts
 D supabase/migrations/20260504_assessments.sql
 D supabase/migrations/20260505_pathway_search.sql
 D supabase/migrations/20260510_demo_rate_limits.sql
 D supabase/migrations/20260516_assessments_user_id.sql
 D supabase/migrations/20260516_drop_legacy_onboarding.sql
 D supabase/migrations/20260516_paid_tier_tables.sql
 D supabase/migrations/20260516_profiles_and_auth.sql
 D supabase/migrations/20260517_assessments_cached_narratives.sql
 D supabase/migrations/20260517_assessments_score_email.sql
 D supabase/migrations/20260517_paid_reports_call_notes.sql
 D supabase/schema.sql
?? app/admin/wa-assistant/
?? app/api/admin/wa-assistant/
?? docs/dns/
?? docs/whatsapp-notes/
?? lib/wa-assistant/
?? plan/active/2026-05-18-wa-assistant-sidecar/
?? supabase/db-may-18.md
```

The migration deletions are concerning — those SQL files are the source of truth for fresh-DB setup. Production DB is fine (Supabase tracks applied migrations), but losing the source means anyone bootstrapping locally has nothing to apply. Two possibilities:

- Deliberate consolidation (maybe replaced by `supabase/db-may-18.md` snapshot?) — if so, the snapshot needs to be the new source of truth and the deletions should be committed
- Accidental — restore from git: `git checkout HEAD -- supabase/migrations/ supabase/schema.sql`

The wa-assistant untracked work is in flight — leave alone unless you want to commit it.

The `lib/auth-guards.ts` modification adds `isAdminEmail()` (used by my Phase 1 admin patch + Phase 4 API routes). It's already wired in; just needs to be committed.

## 2. Playwright parallelism issue

Tests hang/fail when run with the default 8 workers — login form submits but URL stays at `/login`. Affects both `paid-tier.spec.ts` and `auth-flow.spec.ts` (pre-existing). Workaround in use: `--workers=1`, which is ~5x slower but reliable.

Best guess: parallel `registerAndLogin` calls contend on something — either Supabase Auth rate-limiting, server-action serialisation in Next 16, or shared session state in the test browser context. Worth a focused debug session.

Starting points:
- Check Supabase Auth dashboard for `signInWithPassword` rate limits per IP
- Add `console.log` to `login` server action to see if it's even being called per request
- Try `--workers=2` and `--workers=4` to find the breakpoint
- Maybe the dev server's server-action handler is serialising — try production build (`npm run start`) and re-run

## 3. Skipped admin happy-path tests

`tests/admin-post-call.spec.ts` has 4 gate tests (run always, all pass) + 2 happy-path tests (skipped by default).

To enable the happy-path tests, edit `.env.local`:

```bash
# Append to existing ADMIN_EMAILS line, comma-separated:
ADMIN_EMAILS=laudes.michael@gmail.com,playwright-admin@example.com

# Add new line:
PLAYWRIGHT_ADMIN_EMAIL=playwright-admin@example.com
```

Then restart the dev server. The tests use a separate browser context for the admin login so cookies don't collide with the buyer session. Brevo is mocked so no real email goes out.

## What's NOT in scope here

- Phase 5 / further paid-flow work — the refactor shipped 095ef8b → 7fe73e2 and is closed
- Salary tables, country shortlist, 90-day plan — deferred per spec README.md
- wa-assistant sidecar — that's its own plan folder (`plan/active/2026-05-18-wa-assistant-sidecar/`)
