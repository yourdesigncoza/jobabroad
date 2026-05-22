# Social proof — testimonials (deferred)

Status: **deferred — return to this when real pilot quotes are in hand.**
Created during the homepage CRO pass (2026-05-22).

## Why deferred

The homepage CRO work added two honest trust signals that need no users:

- **Founder block** in the trust band — named, photographed, verifiable (links to
  devai.co.za). See `app/page.tsx`.
- **Authority strip** — "Built from official sources" (GOV.UK, U.S. State
  Department, etc.). See `AUTHORITY_SOURCES` in `app/page.tsx`.

Testimonials are the strongest signal but **cannot be fabricated** — the brand
sells *against* fake promises, and POPIA requires explicit consent. There were
0 registered users at the time of writing; only 1–2 pilot users exist. So the
testimonial slot is **not built yet** — build it once real, consented quotes
exist.

## What to collect from each pilot user

Ask them something like:

1. Before Jobabroad, what did you think working abroad would take? What did it
   actually show you?
2. Was there a specific cost, scam, or step you'd have got wrong without it?
3. Did it save you money or a mistake — how?

Then capture, for each person:

- **First name** (surname optional, their choice)
- **Field / category** (e.g. "Teacher", "Nurse")
- **The quote** — one strong, specific sentence or two beats a vague paragraph
- **Explicit consent**: a clear "yes, you may publish this on jobabroad.co.za"
  (keep the message/email as the consent record — POPIA)
- Optional: a photo, with separate consent to use it

One strong, specific quote outperforms several vague ones. Specificity = a real
number, a real country, a real mistake avoided.

## How to build it when ready

- A 1–2 card testimonial block. **Honest scale** — do not pad to look like a
  wall of reviews. With 1–2 quotes, a small "From our pilot" framing is fine.
- Suggested placement: between the FAQ and the country-stats section, or
  directly under the category grid (the decision point).
- Card: quote, then `— First name, Field`. Photo optional.
- Mirror the existing design tokens (see `work-abroad-web/CLAUDE.md`): white
  card, `#EDE8E0` border, charcoal/muted text.
- Add Playwright coverage in `tests/homepage.spec.ts` alongside the existing
  founder-block / authority-strip tests.

## Related future item — partner proof

There is partner *interest* (agencies who would pay for exposure), but interest
is not a publishable trust signal — "trusted by partners" with zero signed
partners is exactly the kind of claim the site tells visitors to distrust.

When partners actually **sign and go live** on `/recruiters` (via the
`lib/trusted-partners.ts` overlay), a "Verified partners" element on the
homepage becomes real proof and can be added then. The homepage layout leaves
room for it.
