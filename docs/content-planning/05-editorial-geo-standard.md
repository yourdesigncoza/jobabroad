# Editorial + GEO Standard

The quality bar a route page must clear before publish. Adapted from the pack's editorial
checklist and hardened for GEO. If a page can't pass this, it's a thin page — don't ship it.

## Content requirements (every route page)

- [ ] **Quick Verdict** — 2–4 sentences, answer-first, lifts cleanly as a standalone
      answer ("Yes/No, because… best suited to…"). High/Medium/Low viability stated.
- [ ] **Route Summary table** — visa route, job-offer-needed, qualification, experience,
      English test, police clearance, apostille, credential evaluation, timeline, cost
      range, scam risk. All cells filled (no `[placeholder]`).
- [ ] **Who it's for / not for** — concrete SA candidate profiles.
- [ ] **Minimum requirements** — work/experience, qualification, registration/licensing
      (name the regulator), personal docs. Only verifiable claims.
- [ ] **Visa / permit route** — who applies, employer's role, refusal triggers, what the
      route does *not* allow. Cite the official visa source inline.
- [ ] **Document checklist** — grouped by action order; links the 3 reusable SA document
      guides rather than repeating them.
- [ ] **Costs in rands** — table of ranges with notes + the date checked. No false precision.
- [ ] **Timeline** — table with risk per step.
- [ ] **Salary / offer sanity check** — how to evaluate an offer; the "high salary means
      nothing if the contract/visa/employer aren't real" warning.
- [ ] **Scam warnings** — route-specific red flags; links `/scam-warnings`.
- [ ] **Best next step** — free eligibility check (primary CTA) + R495 plan (secondary).
- [ ] **FAQ** — 5–6 real questions, each answered self-containedly (feeds FAQ schema).

## GEO requirements

*Confirmed/calibrated against the `seo-geo` skill (Feb 2026 criteria).*

- [ ] **Answer-first** intro: a direct answer in the **first 40–60 words** of the page and
      of each H2 section. AI engines cite passages, not pages.
- [ ] **Citable answer blocks sized 134–167 words.** The Quick Verdict and each key H2
      (visa route, costs, requirements) should resolve into a self-contained block in that
      range — long enough to be a complete answer, short enough to lift whole. Not 2–3
      sentences (too thin to cite), not a wall of text.
- [ ] **Definition in the first 60 words** — "A {visa} is a … that lets …". Definitional
      "X is…" passages are disproportionately cited by AI.
- [ ] **Question-form headings.** Phrase H2/H3s as the queries people ask: "Can South
      African nurses work in Ireland?", "How much does it cost in rands?", "Do I need
      NMBI registration?" — not "Costs" / "Registration". Matches AI query patterns.
- [ ] **At least one on-page visual** (cost chart, timeline graphic, or route image with
      descriptive alt). Multi-modal pages see ~156% higher AI selection. Use the
      `seo-image-gen` skill. (Note: the OG/`opengraph-image` is the social card — it does
      **not** count as on-page multimodal.)
- [ ] **JSON-LD:** `Article` + `BreadcrumbList` + `FAQPage`. `BreadcrumbList` is **net-new**
      (blog/pathways don't emit it yet). Reuse the `JsonLd` component; validate with the
      `seo-schema` skill. Author stays `Organization` (Jobabroad) — see note below.
- [ ] **Inline official-source citations** for every visa/fee/registration claim.
- [ ] **Entity consistency** — role, country, visa, regulator named identically site-wide.
- [ ] **Extractable facts** — costs/timelines in tables, requirements as lists; no
      numbers buried in prose.
- [ ] **Visible "last verified: YYYY-MM-DD"** + real `lastmod`.
- [ ] Page listed in `/llms.txt` once published.

### FAQ schema — calibration

Keep the on-page Q&A (it's the highest-value GEO element). Emit `FAQPage` JSON-LD as the
blog already does — but know that **Google no longer shows FAQ rich results for commercial
sites** (restricted to gov/health since 2023). So the *on-page structured Q&A* is what
earns AI citations; the schema is a harmless, mild aid for AI parsing, not a rich-result
play. Don't over-invest in it expecting SERP snippets.

### E-E-A-T / author — DEFERRED (decision 2026-05-28)

The site sets `author` to the Organization "Jobabroad" (`lib/site.ts` `SITE_AUTHOR`; blog
Article schema uses `@type: Organization`). Work-abroad/visa content is YMYL-adjacent, where
a named-expert (Person) author is a stronger trust signal — but **decision: keep the
Organization author for now** (no personal identity exposed). Route pages emit
`@type: Organization` author, same as blog. Revisit if AI-citation traction stalls; the
Person upgrade (named author + bio + `Person` schema + LinkedIn `sameAs`) remains the
highest-impact E-E-A-T lever if/when we want it.

## Evidence + safety gates (project rules — hard fails)

- [ ] Official source **verified live** (not the pack's original buggy URL; not a `verify`
      flag left unresolved). One primary keyword → one canonical URL (no blog duplicate).
- [ ] **No guaranteed-employment / guaranteed-visa language** anywhere.
- [ ] **No unsupported salary promises.**
- [ ] Any genuinely unresolved fact written as **visible user-facing prose**
      ("We could not confirm X — check [official source] directly"), never an HTML comment.
- [ ] All external links `target="_blank" rel="noopener noreferrer"`.

## Frontmatter contract

Route pages should carry frontmatter compatible with how we already parse blog/pathway
markdown (`lib/blog-content.ts`, `gray-matter`). Minimum:

```yaml
title: "How South African Registered Nurses Can Work in Ireland (2026 Guide)"
slug: "/routes/registered-nurse/ireland/"
category: "healthcare"          # our real slug → links to /pathways/healthcare
role: "Registered Nurse"
country: "Ireland"
route_type: "..."
primary_keyword: "Registered Nurse jobs in Ireland for South Africans"
official_source: "https://enterprise.gov.ie/..."   # verified, not the pack default
last_verified: "YYYY-MM-DD"
scam_risk: "Medium-High"
faqs: [...]
```

## Tone

Plain South African English. Practical, honest, non-hyped. The trust edge (we tell you
the hard parts and the scams) *is* the brand and the E-E-A-T signal.
