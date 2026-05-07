# Jobabroad

South African work-abroad lead-generation site. Production domain: **jobabroad.co.za**.

## What this is

1. Landing page captures interest via category selector → WhatsApp pre-fill
2. WhatsApp conversations handled manually using drip templates
3. PayShap R199 Request to Pay sent to interested leads
4. After payment, `/admin` generates a unique member link
5. Member link is a Supabase-token-gated route serving pathway content + CV upload

See `docs/Work Abroad MVP Plan.md` for the full flow and what is deliberately deferred.

## Stack

- **Next.js 16.2.4** (App Router) + **React 19** — check `node_modules/next/dist/docs/` before using any Next.js APIs
- **Tailwind CSS v4** via `@tailwindcss/postcss` — no `tailwind.config.js`; config is in `postcss.config.mjs`
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`)
- **lucide-react** for icons
- Fonts: Oswald (display) + DM Sans (body)

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
NEXT_PUBLIC_WHATSAPP_NUMBER   # e.g. 27617114715 — used in every wa.me link
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_BASE_URL
ADMIN_SECRET                  # 32-char random string for /admin auth
```

## Architecture

```
app/
  layout.tsx              — Oswald + DM Sans fonts, global metadata
  page.tsx                — landing page (server component, reads ?src=)
  members/[token]/        — token-gated pathway page + assessment
  admin/                  — manual token generator
  api/cv/upload/          — Supabase Storage upload endpoint
  globals.css             — Tailwind base + CSS variables

components/               — presentational, no data fetching
lib/
  categories.ts           — CATEGORIES array + buildWhatsAppLink()
  pathway-content.ts      — reads markdown, renders sanitized HTML, extracts TOC
content/pathways/         — per-category guides (healthcare, teaching, seasonal, …)
docs/                     — MVP plan, semantic-search notes, build prompts
```

## Design tokens

All colors are inlined as `style={}` props — there is no Tailwind theme extension yet.

| Token        | Value     | Use                          |
|--------------|-----------|------------------------------|
| Background   | `#F8F5F0` | page background              |
| Dark green   | `#1B4D3E` | brand primary, CTAs          |
| Charcoal     | `#2C2C2C` | headings                     |
| Gold         | `#C9A84C` | accents, kicker lines        |
| Orange       | `#ff751f` | logo accent ("abroad"), CTAs |
| Muted        | `#6B6B6B` | body copy                    |
| Off-white    | `#EDE8E0` | section backgrounds          |

## UTM tracking

`page.tsx` reads `?src=` from `searchParams` and passes it through to every WhatsApp link via `buildWhatsAppLink(label, src)`. QR codes are printed with unique `?src=batch-001-location` values; Vercel Analytics shows traffic per source.

## Testing

Playwright first — use the Playwright MCP tools in-session for any UI or flow change, and the Playwright CLI for regression suites checked into the repo. Manual browser testing is a last resort.

## Semantic search

See `docs/semantic-search.md` for: when to re-run the index, how to add a new category, troubleshooting, and tuning knobs.
