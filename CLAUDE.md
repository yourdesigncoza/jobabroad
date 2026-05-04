# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## External Links — STRICT RULE

**All external links must open in a new tab.** Never navigate the user away from the app.

- In React/JSX: always include `target="_blank" rel="noopener noreferrer"` on every `<a>` that points outside the app
- In markdown rendered via `marked`: the custom renderer in `lib/pathway-content.ts` handles this automatically — do not remove it
- This applies everywhere: member pages, landing page, admin page, any future pages

## ⚠️ NEXT SESSION — START HERE

**Member page (`/members/[token]`) is built and working end-to-end.**

### What's done
- `content/pathways/healthcare.md` — full nurses guide (6 sections, Gemini-reviewed)
- `content/pathways/teaching.md` — full teaching guide (6 sections, Gemini-reviewed)
- `lib/pathway-content.ts` — reads markdown, renders to sanitized HTML, extracts TOC from h2 headings
- `app/members/[token]/page.tsx` — token-gated page: two-column desktop (sticky TOC left, article right), single column mobile (TOC below article)
- `components/TableOfContents.tsx` — active-section highlighting via IntersectionObserver, collapse toggle
- `components/CVSection.tsx` — CV template download + file upload
- `app/api/cv/upload/route.ts` — uploads to Supabase `cvs` bucket
- `public/cv-template.docx` — basic CV template (8 sections, colour-coded)
- Supabase schema applied + `cvs` bucket created ✅
- All external links open in new tab (enforced in marked renderer + CLAUDE.md rule)

### UI state (polish in progress)
- Table cell padding ✅
- Table horizontal scroll on mobile (min-width 1000px) ✅
- Page width widened to `max-w-6xl` ✅
- "My CV" anchor link in top nav ✅

### What to do next
- Continue UI polish on the member page (typography, spacing, mobile feel)
- Review the CV template and refine it
- Test full flow end-to-end on mobile
- Eventually: build guides for other categories (IT/tech, engineering, accounting)

### Test token (healthcare, local dev)
`http://localhost:3000/members/3c625e74-5f85-4d61-844b-3087a8e27ed8`

All 6 nursing vaults are complete (separate vaults per prompt):
- `wa-nursing-01-destinations` — 45 notes, 686 nodes
- `wa-nursing-02-documents` — 34 notes, 330 nodes
- `wa-nursing-03-costs` — 47 notes, 525 nodes
- `wa-nursing-04-visa-routes` — 28 notes, 534 nodes
- `wa-nursing-05-scams` — 25 notes, 514 nodes
- `wa-nursing-06-contacts` — 45 notes, 531 nodes

**Guide status:** `docs/guides/healthcare-nurses.md`
- [x] Section 1 — Destination Options (Gemini reviewed + approved)
- [x] Section 2 — Document Checklist (Gemini reviewed + approved)
- [x] Section 3 — Realistic Costs (Gemini reviewed + corrections applied)
- [x] Section 4 — Visa Route Overview (Gemini reviewed + corrections applied)
- [x] Section 5 — Scam Red Flags (Gemini reviewed + corrections applied)
- [x] Section 6 — Legitimate Contacts (Gemini reviewed + corrections applied)

**Section 4 key facts confirmed (do not re-debate):**
- NZ OSCE: old CAP deprecated Dec 2023; replaced by OSCE (2-day + 3hr exam, Christchurch) NZ$3,000–3,500; SA nurses should expect it (non-comparable jurisdiction)
- NZ CGFNS: USD$300 (CGFNS) + USD$380 (CVS-NCNZ) — replaces RNZCUS from mid-2025
- AHPRA OBA pathway DOES include an OSCE (AUD$3,000–3,500); Pathway 2 eliminates it for UK-first nurses
- UK: SA NOT on UKVI English exempt list; NMC Option 1 (training-in-English evidence) may avoid IELTS/OET
- IHS waiver is for HCW visa holder only — dependants pay full IHS
- CSIT AUD$76,515 is subject to annual July indexation

**After guide complete:** build `lib/pathway-content.ts` + `app/members/[token]/page.tsx` + Supabase schema.

---

@AGENTS.md

## Testing — Playwright First

**Always use Playwright for any UI or flow testing.** Prefer the Playwright MCP tools (available in-session) over writing standalone test files. For repeatable regression tests, use the Playwright CLI.

### Priority order
1. **Playwright MCP** (`mcp__plugin_playwright_playwright__*`) — use in every session after UI changes; no setup required
2. **Playwright CLI** (`npx playwright test`) — for automated regression suites checked into the repo
3. **Manual browser testing** — last resort only; never the primary verification method

### What to test with Playwright after every feature
- Happy path: full user flow end-to-end
- State persistence: navigate away and return, verify server-hydrated data matches
- Edge cases visible in the UI (empty states, error states, conditional fields)

### Test token (healthcare, local dev)
`http://localhost:3000/members/3c625e74-5f85-4d61-844b-3087a8e27ed8`
`http://localhost:3000/members/3c625e74-5f85-4d61-844b-3087a8e27ed8/assessment`

### Automation goal
Optimise and automate the dev + test loop as far as possible. When adding a new feature, write or update Playwright tests in the same session before marking the task done.

## Commands

```bash
npm run dev          # start dev server on localhost:3000
npm run build        # production build
npm run lint         # eslint
npx playwright test  # run Playwright regression suite (once tests exist)
```

## What this is

**Jobabroad** — a South African work-abroad lead-generation site. The business model:

1. Landing page captures interest via category selector → WhatsApp pre-fill
2. John handles WhatsApp conversations manually using drip templates
3. John sends a PayShap R199 Request to Pay
4. After payment, John opens `/admin`, generates a unique member link, sends it via WhatsApp
5. Member link is a Supabase-token-gated route serving pathway content + CV upload

See `docs/Work Abroad MVP Plan.md` for the full flow and what is deliberately deferred.

## Stack

- **Next.js 16.2.4** (App Router) + **React 19** — check `node_modules/next/dist/docs/` before using any Next.js APIs
- **Tailwind CSS v4** via `@tailwindcss/postcss` — no `tailwind.config.js`; config is in `postcss.config.mjs`
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) — not yet wired up; schema lives in `docs/Work Abroad MVP Plan.md`
- **lucide-react** for icons

## Architecture

```
app/
  layout.tsx        — Oswald + DM Sans fonts, global metadata
  page.tsx          — full landing page (server component, reads ?src= searchParam)
  globals.css       — Tailwind base + CSS variable declarations

components/         — all presentational, no data fetching
  InterestGrid.tsx  — 'use client', renders CategoryCard grid
  CategoryCard.tsx  — single tile linking to WhatsApp
  CategoryIcon.tsx  — Lucide icon map per category id
  StatStrip / HowItWorks / CountryStats / FAQ / WhatsAppIcon

lib/
  categories.ts     — CATEGORIES array (single source of truth) + buildWhatsAppLink()
```

**What's not built yet** (next phases per MVP plan):
- `app/admin/page.tsx` — manual token generator for John
- `app/api/admin/generate-token/route.ts`
- `app/members/[token]/page.tsx` — token-gated pathway content
- `lib/pathway-content.ts` — content per category
- `app/api/cv/upload/route.ts` + `components/CVSection.tsx`
- `app/privacy/page.tsx`

## Design tokens

All colors are inlined as `style={}` props — there is no Tailwind theme extension yet.

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

## Environment variables

```
NEXT_PUBLIC_WHATSAPP_NUMBER   # e.g. 27821234567 — used in every wa.me link
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_BASE_URL
ADMIN_SECRET                  # 32-char random string for /admin auth
```

## Domain

Production domain: **jobabroad.co.za**

## UTM tracking

`page.tsx` reads `?src=` from `searchParams` and passes it through to every WhatsApp link via `buildWhatsAppLink(label, src)`. QR codes are printed with unique `?src=batch-001-location` values; Vercel Analytics shows traffic per source.
