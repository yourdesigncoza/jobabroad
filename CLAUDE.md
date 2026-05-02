# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## ⚠️ NEXT SESSION — START HERE

**Build `lib/pathway-content.ts` + `app/members/[token]/page.tsx`**

The R199 product is not yet built. The target reader is NOT thinking "pathway" —
they are thinking:

- How do I actually get there?
- What papers do I need?
- How much will it cost me?
- Who do I contact?
- Will I get scammed?

Each category guide must answer all five. Structure per guide:
1. Destination options (which countries are realistic for this field)
2. Step-by-step document checklist
3. Realistic costs (visa fees, flights, relocation estimate)
4. Current visa route overview
5. Scam red flags specific to this field
6. Legitimate programme contacts / official links

**Decision needed before building:** what format is the guide?
- A structured page on the members site (preferred — easy to update)
- A downloadable PDF
- Both

Also: update step 3 copy in `components/HowItWorks.tsx` — replace
"unlock your complete pathway guide" with language that mirrors the
five questions above.

---

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server on localhost:3000
npm run build    # production build
npm run lint     # eslint
```

No test suite exists yet.

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
