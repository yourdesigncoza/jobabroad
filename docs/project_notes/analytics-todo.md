# TODO — Analytics: funnel events + GA4

**Status:** Deferred / not started. Scoped 2026-05-22, parked for later.
**Decided scope:** "Both" — conversion-funnel event tracking *and* Google Analytics 4.

## Current state (already live)

- `@vercel/analytics` + `@vercel/speed-insights` — installed, rendered in `app/layout.tsx`
- Custom events: only `category_click` (`CategoryCard.tsx`) and a generic `TrackedLink.tsx` wrapper — both call Vercel `track()` directly
- No GA4 / gtag. No tracking on the money path (register → assessment → score → book → checkout → payment)

## Plan

**1. Central module `lib/analytics.ts`**
- `trackEvent(name, props?)` → fires Vercel `track()` *and* GA4 `gtag('event')` in one call; typed event-name union
- Refactor `TrackedLink.tsx` + `CategoryCard.tsx` to use it (DRY — they call `track()` raw today)

**2. GA4 install**
- Add `@next/third-parties`; `<GoogleAnalytics gaId={NEXT_PUBLIC_GA_ID}>` in `app/layout.tsx` — official component, handles SPA pageviews (raw `next/script` does not)
- New env var `NEXT_PUBLIC_GA_ID`; no-ops when unset so local/preview builds stay clean
- Consent wiring depends on the open decision below

**3. Funnel events** (client-side `trackEvent`)

| Event | Fires from |
|---|---|
| `register_start` / `register_complete` | `RegisterForm.tsx` |
| `assessment_start` / `assessment_complete` | `AssessmentWizard.tsx` |
| `score_view` | `app/members/[category]/score/page.tsx` |
| `booking_consent` | `BookingClient.tsx` |
| `checkout_start` | Paystack checkout button |
| `payment_success` | `app/members/[category]/paid/page.tsx` render |
| `partner_click {partner, location}` | outbound links on recruiters + trusted-partner blocks — this is what produces Apostil referral numbers for the Jesse Green partnership |

**4. Tests** — Playwright: GA script loads; key events fire (intercept `/g/collect` + `/_vercel/insights`)

**5. Docs** — `docs/analytics.md` event dictionary; add a GA4 line to the privacy policy

## Open decision — GA4 consent (POPIA)

GA4 sets cookies (Vercel Analytics does not). Pick one before building step 2:

- **A. Load GA4 unconditionally, no banner** — simplest, common in SA, POPIA-tolerant not strict; needs a privacy-policy disclosure line.
- **B. Consent Mode v2 + cookie banner** — GA4 default-denied, upgrades on Accept; proper consent; adds a new banner component + consent state; data gap from users who decline/ignore.
- **C. GA4 unconditionally, IP-anonymised, no banner** — no banner, Google Signals / ads personalisation off, lighter PII footprint; still needs a privacy-policy line.

## Other prose notes

- **GA4 Measurement ID** — confirm whether a GA4 property exists. If yes, set `NEXT_PUBLIC_GA_ID=G-XXXXXXX` in Vercel. If not, create one at analytics.google.com first. Code is env-var-driven so this does not block the build.
- **`payment_success`** — planned client-side on the `/paid` page render. Paystack webhook is the authoritative signal; server-side GA (Measurement Protocol) is more robust but more work — fine to skip for the teaching-only pilot volume.
