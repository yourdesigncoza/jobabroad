# Design System

Canonical style reference for jobabroad.co.za. Reconciles the token table in
`CLAUDE.md` with the runtime source of truth in `app/globals.css` and
`app/layout.tsx`.

**Two sources, two roles:**
- `app/globals.css` (`@theme inline` block) — runtime source of truth for every
  colour **except orange**.
- This doc + `CLAUDE.md` — the complete brand reference, including orange, which
  is never registered as a CSS token (it is always inlined where used).

There is **no `tailwind.config.js`** (Tailwind v4; config is in
`postcss.config.mjs`) and **no Tailwind theme extension** — all colours are
applied as inline `style={}` props on elements. The CSS `@theme` tokens exist
mainly so `font-display` / `font-body` and a few utility colours resolve; in
practice components hardcode the hex values.

## Colour palette

### Core (CSS tokens in `globals.css`)

| Token (CSS var) | Hex | Usage count* | Use |
|---|---|---|---|
| `--color-charcoal` | `#2C2C2C` | 198 | headings, body text |
| `--color-green` | `#1B4D3E` | 150 | brand primary, CTAs, scrollbar thumb |
| `--color-cream-dark` | `#EDE8E0` | 129 | section backgrounds, alt table rows |
| `--color-cream` | `#F8F5F0` | 123 | page background |
| `--color-gray` | `#6B6B6B` | 116 | muted body copy |
| (white) | `#FFFFFF` | 93 | card surfaces, table borders |
| `--color-gold` | `#C9A84C` | 87 | accents, kicker lines |
| `--color-green-light` | `#2A6B55` | — | secondary / hover green |
| `--color-gold-light` | `#E2C97A` | 1 | gold hover |

\* Approximate inline-hex occurrences across `app/` + `components/` — a proxy for
how load-bearing each colour is.

### Brand accent (inlined only — NOT a CSS token)

| Name | Hex | Usage count | Use |
|---|---|---|---|
| Orange | `#ff751f` | 74 | logo accent ("abroad"), CTAs |

Because orange has no `@theme` entry, search for the literal `#ff751f` (or
`#FF751F`) when you need to find or change it.

### Status / semantic colours

Used on scam-warning pages, error states, and red-flag callouts. Not formal
tokens — inlined per use. Standardise on these rather than introducing new reds:

| Hex | Use |
|---|---|
| `#B53A2B` | danger / scam-warning accent (primary error red) |
| `#7A1F1F`, `#8C2A2A`, `#8A6A1F` | dark red/amber text on warning callouts |
| `#B00020`, `#DC2626`, `#B22222` | error text (validation, alerts) |
| `#B8902F` | dark gold text |
| `#FFF8E8`, `#FFF6E0`, `#FFF3D6`, `#FFF4EC`, `#FFD1B8` | warm callout/badge tints |
| `#FDEDEC`, `#FBEFEF`, `#F8D7D1` | red callout tints |
| `#E8F0EC`, `#DCEFE6` | green callout tints |

## Typography

Loaded via `next/font/google` in `app/layout.tsx`.

| Role | Font | CSS var | Weights | Fallback |
|---|---|---|---|---|
| `font-display` | **Oswald** | `--font-oswald` | 400, 500, 600, 700 | `"Arial Narrow", sans-serif` |
| `font-body` | **DM Sans** | `--font-dm-sans` | 400, 500, 600 | `Arial, sans-serif` |

- Both use `display: "swap"`.
- Headings `h1–h4` → Oswald, `letter-spacing: 0.02em`, typically uppercase.
- `body` → DM Sans, charcoal `#2C2C2C` on cream `#F8F5F0`, `-webkit-font-smoothing: antialiased`.
- `html { scroll-behavior: smooth }`.

## Brand rules (strict)

- **Logo:** "abroad" is *always* orange `#ff751f`. "job" is **white** on dark
  backgrounds, **charcoal** `#2C2C2C` on light backgrounds.
- **External links:** every external `<a>` opens in a new tab —
  `target="_blank" rel="noopener noreferrer"`. Markdown links get this
  automatically via the `marked` renderer in `lib/pathway-content.ts`; do not
  remove it. (See the External Links rule in `CLAUDE.md`.)
- **No theme extension:** apply colours as inline `style={}` props, not Tailwind
  colour utilities.

## Component patterns

The only bespoke component CSS lives in `app/globals.css`.

### Category card (`.category-card`)
- Hover: `translateY(-3px)` + green-tinted shadow `0 12px 32px rgba(27,77,62,0.25)`.
- Emoji (`.card-emoji`) scales `1.2×` on hover; SVG icons scale `1.15×` and flip
  to charcoal.
- CTA (`.card-cta`) flips brand orange → **white** on the gold hover state
  (orange-on-gold is low-contrast), via `!important` over the inline orange.
- Labels/descriptions/badges shift to charcoal tints on hover.

### Members prose tables (`.prose`)
- White cell borders (`#FFFFFF`), padded cells.
- Alternating rows: even rows get `#EDE8E0`.
- Horizontal scroll on mobile via `.table-scroll` (min-width `1000px`,
  thin scrollbar coloured green `#1B4D3E` on cream-dark `#EDE8E0`).

## Notes on drift

- The CSS token names differ from the `CLAUDE.md` table labels (e.g.
  `--color-green` ↔ "Dark green", `--color-cream` ↔ "Background"). Same values,
  different names.
- `--color-green-light` (`#2A6B55`) and `--color-gold-light` (`#E2C97A`) exist
  in CSS but are largely unused — keep for hover states.
- If you add a recurring colour, prefer extending the `@theme inline` block in
  `globals.css` over scattering new hex literals — but match the existing
  inline-`style` convention for application.
