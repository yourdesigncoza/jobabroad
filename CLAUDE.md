# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

@AGENTS.md

## What this is

**Jobabroad** (jobabroad.co.za) — a South African work-abroad lead-gen + paid-tier site. Flow:

1. Landing page captures interest by category
2. User registers (`/register?category=...`) → Supabase Auth email+password, category **locked** at signup
3. Free tier: pathway guide at `/members/[category]` + eligibility assessment
4. Paid tier (R495, currently **teaching-only pilot**): personalised PDF report + Cal.com booking + post-call notes from John

See `docs/Work Abroad MVP Plan.md` for the full flow and what is deliberately deferred.

## Stack

- **Next.js 16.2.4** (App Router) + **React 19** — this version has breaking changes from older Next.js. Always check `node_modules/next/dist/docs/` before using any Next.js API.
- **Tailwind CSS v4** via `@tailwindcss/postcss` — no `tailwind.config.js`; config is in `postcss.config.mjs`
- **Supabase Auth + Postgres** (`@supabase/ssr`) — profiles + assessments + paid tier tables
- **Paystack** — payments (R495 = 49500 cents); swappable via `lib/payments/provider.ts`
- **Cal.com** embed — booking (`@calcom/embed-react`)
- **OpenAI** — RAG for personalised reports (pgvector embeddings)
- **@react-pdf/renderer** — generates report PDFs server-side, cached to Supabase Storage `paid-reports` bucket
- **Brevo** — transactional email (`lib/email/brevo.ts`)
- **BotID** + **Vercel Analytics / Speed Insights**

## Commands

```bash
npm run dev          # start dev server on localhost:3000
npm run build        # production build
npm run lint         # eslint
npm run reindex      # rebuild pathway_chunks (semantic search index) — see docs/semantic-search.md
npx playwright test                     # full regression suite
npx playwright test paid-tier.spec.ts   # single spec
npx playwright test -g "registers"      # single test by name
```

`playwright.config.ts` loads `.env.local`, baseURL `http://localhost:3000`, retries=0. Tests assume the dev server is already running.

## Architecture

### Routing (app/)

**Public**
- `/` — landing (category grid, FAQs, country stats)
- `/demo/[category]` — public preview of paid content (rate-limited)
- `/recruiters` — partner list (premium highlighted)
- `/scam-warnings` — safety guide

**Auth**
- `/login`, `/register` (pre-selects category from `?category=`), `/auth/callback`, `/auth/confirm-email`, `/forgot-password`, `/reset-password`

**Members (gated by `requireProfile()` + category match)**
- `/dashboard` — post-login hub
- `/members/[category]` — pathway guide (server-rendered from `content/pathways/[category].md`)
- `/members/[category]/assessment` — `AssessmentWizard` (multi-step form)
- `/members/[category]/score` — rubric-computed score + band
- `/members/[category]/book` — Cal.com booking consent (POPIA)
- `/members/[category]/paid` — Paystack checkout success

**Admin (`ADMIN_EMAILS` env gated)**
- `/admin/post-call` — paid-user list w/ booking + report + call-notes editor

**API routes**
- `/api/assessment/save`, `/api/assessment/submit`
- `/api/payments/checkout` (Paystack init), `/api/payments/webhook` (success → `tier='paid'`)
- `/api/booking/consent` — POPIA consent record
- `/api/reports/generate`, `/api/reports/download` — PDF gen via GPT + RAG, cached as 5-min signed URL
- `/api/follow-up/send` — Brevo follow-up email
- `/api/admin/post-call/generate` — admin saves call notes into `paid_reports.call_notes`
- `/api/search/...`, `/api/wiki/[id]` — RAG corpus search + wiki fetch

### Auth guards (`lib/auth-guards.ts`)

- `requireSession()` — redirects to `/login?next=...`
- `requireProfile()` — extends with the `profiles` row (must exist)
- `requireAdmin()` — checks `ADMIN_EMAILS`
- `getCurrentTier()` — returns `'paid' | 'free' | null` for chrome gating

Category cross-access is blocked in `app/members/[category]/page.tsx`; mismatched users are redirected to their own category.

### Paid tier flow

`assessment submit → score → book → checkout → webhook flips tier → report generate (RAG-enhanced PDF) → admin adds call notes after Cal.com session`

Key files:
- `lib/scoring/index.ts` — `calculateScore(answers, rubric)` → dimensions + band (`high_blockers | needs_prep | strong_potential`)
- `lib/scoring/rubrics/teaching.json` — only teaching rubric exists; others return null (teaching-only pilot)
- `lib/reports/generator.ts` — `searchCorpus()` → GPT → `<ReportTemplate>` PDF → cache to `paid-reports` bucket
- `lib/payments/provider.ts` — Paystack adapter (swap point if changing provider)
- `lib/recruiters.ts` + `lib/premium-partners.ts` — recruiter directory + R495-tier overlay

### Assessment system

- Steps defined per category in `lib/assessments/steps/[category].ts` (11 categories)
- Field IDs are versioned (e.g. `personal.full_name.v1`); schema version tracked on the row
- Storage: `assessments` table — `data` (jsonb), `completed_step_slugs[]`, `status` (draft|submitted), `schema_version`
- `AssessmentWizard.tsx` saves a draft after each step; final submit flips `status` and unlocks `/score`

### Content (`content/pathways/`)

All 11 categories complete: `accounting`, `au-pair`, `engineering`, `farming`, `healthcare`, `hospitality`, `it-tech`, `seasonal`, `teaching`, `tefl`, `trades`.

`lib/pathway-content.ts` reads the markdown, sanitizes via `sanitize-html`, renders via `marked` with a custom renderer (forces `target="_blank" rel="noopener noreferrer"` on every external link), and extracts a TOC from h2 headings.

### Supabase migrations (`supabase/migrations/`)

1. `20260504_assessments.sql` — assessments table
2. `20260505_pathway_search.sql` — pgvector + `search-pathway` function for RAG
3. `20260510_demo_rate_limits.sql` — public demo throttling
4. `20260516_assessments_user_id.sql` — backfill user_id after auth migration
5. `20260516_drop_legacy_onboarding.sql` — drop old member_tokens flow
6. `20260516_paid_tier_tables.sql` — `profiles.tier`, `bookings`, `paid_reports`
7. `20260516_profiles_and_auth.sql` — profiles table + `handle_new_user` trigger
8. `20260517_paid_reports_call_notes.sql` — `paid_reports.call_notes` column

### Scripts (`scripts/`)

- `reindex.ts` — rebuild pathway corpus embeddings (run after publishing any pathway guide)
- `seed-score-test-user.ts` — create test user with submitted teaching assessment
- `render-step4-fixture.ts` — generate sample assessment data
- `outreach-drafts/` — per-batch Gmail draft generation (see `~/.claude/templates/outreach-drafts/`)

## Testing — Playwright First

**Always use Playwright for any UI or flow testing.** Prefer the Playwright MCP tools in-session; use the CLI for regression suites checked into `tests/`.

Priority: MCP (`mcp__plugin_playwright_playwright__*`) → CLI → manual (last resort).

Test what matters after every feature: happy path, state persistence after navigation, visible edge/error states.

`tests/helpers.ts` exposes the standard fixtures: `svc()`, `uniqueEmail()`, `uniquePhone()`, `registerAndLogin()`, `makePaid()`, `insertSubmittedTeachingAssessment()`, `deleteAllPlaywrightUsers()`.

When adding a feature, write or update Playwright tests in the same session before marking done.

## External Links — STRICT RULE

**All external links must open in a new tab.** Never navigate the user away from the app.

- React/JSX: always `target="_blank" rel="noopener noreferrer"` on every external `<a>`
- Markdown via `marked`: handled automatically by the renderer in `lib/pathway-content.ts` — do not remove it
- Applies everywhere: member pages, landing, admin, future pages

## build-pathway — Unresolved Claims Rule

When any build-pathway stage leaves an item genuinely unresolved (no primary source, conflicting sources, unfetchable official page), **write the uncertainty as visible user-facing prose** — not an HTML comment. Readers cannot see HTML comments.

Use plain language: "We could not get a definitive answer on X — check [official source] directly before acting." Never leave `<!-- UNRESOLVED: -->` or `<!-- TODO: -->` blocks in published guide markdown.

## Semantic search

See `docs/semantic-search.md` for: when to re-run the index, how to add a new category, troubleshooting, tuning knobs. After any pathway publish: `npm run reindex -- --category=<name>` (register the category in `scripts/reindex.ts` first if it's new).

## Design tokens

All colors are inlined as `style={}` props — no Tailwind theme extension.

| Token | Value | Use |
|---|---|---|
| Background | `#F8F5F0` | page background |
| Dark green | `#1B4D3E` | brand primary, CTAs |
| Charcoal | `#2C2C2C` | headings |
| Gold | `#C9A84C` | accents, kicker lines |
| Orange | `#ff751f` | logo accent ("abroad"), CTAs |
| Muted | `#6B6B6B` | body copy |
| Off-white | `#EDE8E0` | section backgrounds |

Typography: `font-display` = Oswald (headings, uppercase tracking), `font-body` = DM Sans (body copy).

Logo rule: **"abroad" is always orange `#ff751f`**; "job" is white on dark bg, charcoal on light bg.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_BASE_URL              # http://localhost:3000 dev; https://jobabroad.co.za prod
NEXT_PUBLIC_WHATSAPP_NUMBER       # bare digits, e.g. 27617114715 — used in wa.me links
PAYSTACK_SECRET_KEY
PAYSTACK_PUBLIC_KEY
OPENAI_API_KEY                    # report generation + RAG
BREVO_API_KEY                     # transactional email
ADMIN_EMAILS                      # comma-separated; gates /admin and /api/admin/*
CALCOM_LINK                       # booking embed
```

## UTM tracking

`app/page.tsx` reads `?src=` from `searchParams` and passes it through to every WhatsApp link via `buildWhatsAppLink(label, src)`. QR codes are printed with unique `?src=batch-001-location` values; Vercel Analytics shows traffic per source.

## Out of scope (do not reintroduce)

- **CV service** (review/template/upload) — removed 2026-05-15. Do not bring back `CVSection`, `/api/cv/*`, `public/cv-template.*`, or any "My CV" nav entry.
- **WhatsApp drip onboarding** — retired 2026-05-16. Buttons stay for nurture/upsell; signup goes through Supabase Auth.
- **Remote-work category in build-pathway** — separate idea; landing-page tile only.
