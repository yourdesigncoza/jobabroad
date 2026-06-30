# Jobabroad

South African **work-abroad guidance platform**. Production domain: **jobabroad.co.za**.

Free pathway guides and eligibility assessments for people who want to work overseas, plus a paid tier that delivers a personalised report, a coaching call, and an AI coach.

## What this is

1. Landing page presents work-abroad categories (teaching, healthcare, engineering, …)
2. User registers (`/register?category=…`) → Supabase Auth email + password; **category is locked at signup**
3. **Free tier:** pathway guide at `/members/[category]` + eligibility assessment + score
4. **Paid tier (R495, teaching-only pilot):** personalised PDF report (GPT + RAG) auto-generated on payment, optional Cal.com booking, and post-call notes from John
5. Paid users also get an AI coach grounded in the pathway corpus

See `docs/Work Abroad MVP Plan.md` for the full flow and what is deliberately deferred.

## Stack

- **Next.js 16.2.4** (App Router) + **React 19** — check `node_modules/next/dist/docs/` before using any Next.js API
- **Tailwind CSS v4** via `@tailwindcss/postcss` — no `tailwind.config.js`; config is in `postcss.config.mjs`
- **Supabase Auth + Postgres** (`@supabase/ssr`) — profiles + assessments + paid-tier tables, pgvector for RAG
- **Paystack** — payments (R495 = 49500 cents); swappable via `lib/payments/provider.ts`
- **Cal.com** embed — booking (`@calcom/embed-react`)
- **OpenAI** — RAG for personalised reports + AI coach
- **@react-pdf/renderer** — server-side report PDFs, cached to Supabase Storage `paid-reports` bucket
- **Brevo** — transactional email (`lib/email/brevo.ts`)
- **BotID** + **Vercel Analytics / Speed Insights**
- **lucide-react** icons; fonts: Oswald (display) + DM Sans (body)

## Commands

```bash
npm run dev          # start dev server on localhost:3000
npm run build        # production build
npm run lint         # eslint
npm run reindex      # rebuild pathway_chunks (semantic search index)
npx playwright test  # run Playwright regression suite
```

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_BASE_URL              # http://localhost:3000 dev; https://jobabroad.co.za prod
NEXT_PUBLIC_WHATSAPP_NUMBER       # bare digits, e.g. 27617114715 — used in wa.me links
PAYSTACK_SECRET_KEY
PAYSTACK_PUBLIC_KEY
OPENAI_API_KEY                    # report generation + RAG + AI coach
BREVO_API_KEY                     # transactional email
ADMIN_EMAILS                      # comma-separated; gates /admin and /api/admin/*
CALCOM_LINK                       # booking embed
CRON_SECRET                       # Bearer secret for /api/cron/agent-nudge
```

## Architecture

```
app/
  layout.tsx              — Oswald + DM Sans fonts, global metadata
  page.tsx                — landing page (category grid, FAQs, country stats; reads ?src=)
  pathways/[category]/     — public preview of the pathway guide (SEO pillar pages)
  blog/                    — SEO articles linking back to their pillar pathway
  register/, login/        — Supabase Auth flows (category pre-selected from ?category=)
  dashboard/               — post-login hub
  members/[category]/      — gated pathway guide, assessment, score, booking, paid success
  admin/                   — post-call notes + WhatsApp reply assistant (ADMIN_EMAILS gated)
  api/                     — assessment, payments (Paystack), reports, AI agent, cron nudge

lib/
  auth-guards.ts          — requireSession / requireProfile / requireAdmin / getCurrentTier
  payments/provider.ts    — Paystack adapter (swap point)
  scoring/                 — calculateScore + rubrics + LLM narratives
  reports/                 — RAG → GPT → PDF generator, cached to Supabase Storage
  pathway-content.ts       — reads markdown, renders sanitized HTML, extracts TOC
content/pathways/         — 11 per-category guides (teaching, healthcare, engineering, …)
content/blog/             — SEO articles (hub-and-spoke)
supabase/migrations/      — schema (see supabase/db-may-18.md snapshot)
```

## Design tokens

All colors are inlined as `style={}` props — there is no Tailwind theme extension.

| Token        | Value     | Use                          |
|--------------|-----------|------------------------------|
| Background   | `#F8F5F0` | page background              |
| Dark green   | `#1B4D3E` | brand primary, CTAs          |
| Charcoal     | `#2C2C2C` | headings                     |
| Gold         | `#C9A84C` | accents, kicker lines        |
| Orange       | `#ff751f` | logo accent ("abroad"), CTAs |
| Muted        | `#6B6B6B` | body copy                    |
| Off-white    | `#EDE8E0` | section backgrounds          |

Logo rule: **"abroad" is always orange `#ff751f`**; "job" is white on dark, charcoal on light.

## UTM tracking

`page.tsx` reads `?src=` from `searchParams` and passes it through to every WhatsApp link via `buildWhatsAppLink(label, src)`. QR codes are printed with unique `?src=batch-001-location` values; Vercel Analytics shows traffic per source.

## Testing

Playwright first — use the Playwright MCP tools in-session for any UI or flow change, and the Playwright CLI for regression suites checked into the repo. Manual browser testing is a last resort.

## Semantic search

See `docs/semantic-search.md` for: when to re-run the index, how to add a new category, troubleshooting, and tuning knobs.
