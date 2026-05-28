# GEO Content Strategy — Jobabroad

**Goal:** become the source South Africans (and the AI engines they ask) trust for
"can I work in {country} as a {role}, and how?" — and convert that trust into free
eligibility checks and R495 action plans.

GEO = Generative Engine Optimization: being the page that Google AI Overviews,
ChatGPT search, Perplexity, and Bing Copilot **quote and cite**, not just the page that
ranks tenth on a blue-link SERP. The two overlap heavily (good GEO is good SEO), but GEO
rewards a specific shape of content — see "GEO principles" below.

## The opportunity (why this works for Jobabroad)

- The queries are **long-tail, intent-rich, and underserved**: "registered nurse jobs
  in the UK for South Africans", "do I need SAQA to work in Australia as an electrician".
  Big job boards rank for the head term; almost nobody answers the SA-specific version well.
- The answers are **factual and structured** (visa route, documents, costs in rands,
  timeline, scam flags) — exactly the shape AI engines extract and cite.
- We have a **trust edge** (scam warnings, recruiter verification) that the content can
  lean on, which is also an E-E-A-T signal.
- We have a **commercial endpoint** (free check → R495 plan) that fits the funnel.

## The 5-layer information architecture

| Layer | URL | Status | Job | Intent |
|---|---|---|---|---|
| 1. Pillar | `/pathways/[category]` | LIVE (11) | Category authority hub | Broad: "teaching jobs abroad" |
| 2. Route | `/routes/[role]/[country]` | NEW (≤120) | The PSEO + GEO core unit | Specific: "{role} jobs in {country} for SA" |
| 3. Comparison | `/compare/...` or blog | PARTIAL | "X vs Y" decision content | "UK vs Ireland for SA nurses" |
| 4. Support / trust | `/scam-warnings`, `/recruiters`, document guides | PARTIAL | Reusable trust + how-to assets | "police clearance for UK visa" |
| 5. Answer / authority | `/blog` | LIVE (10) | Question-led narrative articles | "how to", "without a degree", "best countries" |

The layers link **down** (pillar → routes → support) and **up** (route → pillar, route →
relevant blog). The link graph (layer 3 of `03-internal-linking.md`) is what turns this
from "120 thin pages" into a topical authority cluster.

### Route page is the unit of work

`/routes/{role}/{country}/` — one realistic work-abroad route per page. Built from a
fixed template (`templates/route-page.md`) so every page reliably contains a verdict,
requirements, documents, rand costs, timeline, offer sanity-check, scam warnings,
official sources, FAQ, and a CTA. Standardised structure = predictable GEO extraction.

## How routes relate to the existing blog + pathways (the de-dup rule)

**Critical:** several of the highest-priority routes are *already published as blog posts*.
Building duplicate route pages there would cannibalise our own rankings.

| Existing blog | Overlapping route | Rule |
|---|---|---|
| `nursing-jobs-uk-from-south-africa` + `nurse-salary-uk-vs-south-africa` | RN → UK (rank 1) | Blog is canonical. Do **not** build a duplicate route page. Optionally retrofit the blog into the route template later. |
| `au-pair-in-america-from-south-africa` | Au Pair → US (rank 2) | Blog is canonical. No duplicate. |
| `teach-in-uk-from-south-africa` | Qualified Teacher → UK (rank 3) | Blog is canonical. No duplicate. |
| `it-jobs-abroad-from-south-africa` | Software Developer → IE/DE/CA/AU (ranks 7–10) | Blog is the *category* answer; the per-country routes are net-new and complementary. Build the routes, link to/from the blog, keep keywords distinct. |

**Operating rule going forward:**
- **Blog** = top-of-funnel, narrative, question/comparison/"best of" intent. One per big question.
- **Route** = transactional, structured, single `{role}+{country}` fact sheet.
- Before creating any route page, check `content/blog/` for an existing post on the same
  role+country. If one exists, the blog is canonical — link, don't duplicate.

## GEO principles (every page must follow)

1. **Answer first.** Open with a direct verdict in the **first 40–60 words** that a model
   can lift verbatim ("Yes — a South African registered nurse can work in the UK on a
   Health and Care Worker visa, but you must first register with the NMC..."), and include
   a one-line **definition** of the visa/route ("A Health and Care Worker visa is…"). The
   template's "Quick Verdict" enforces this.
2. **Self-contained passages, 134–167 words.** Each H2 answers one question completely
   without relying on the rest of the page, sized to the AI-citation sweet spot (~134–167
   words) — not a thin 2-sentence stub, not a wall of text. Use **question-form headings**
   ("How much does it cost in rands?") to match query patterns. AI engines cite passages,
   not pages.
3. **Structured data.** Mark up every page with `FAQPage`, `BreadcrumbList`, and
   `Article` JSON-LD; use `HowTo` where there's a real step sequence. (We already have a
   `JsonLd` component and the `seo-schema` skill.)
4. **Cite authoritative sources inline.** Link the official government/regulator page for
   every factual claim about visas, fees, or registration. This is both a trust signal
   and what makes a model comfortable citing us.
5. **Entity clarity.** Name the entities explicitly and consistently: the role, the
   country, the visa/permit, the regulator. Use the same names site-wide.
6. **Consistent, extractable facts.** Costs as rand ranges in a table, timelines in a
   table, requirements as lists. No prose-buried numbers.
7. **Freshness.** Every page carries a visible "last verified" date and a real `lastmod`
   in the sitemap. Re-verify official fees/rules on a schedule.
8. **`llms.txt`.** Publish `/llms.txt` listing the pillar guides, top routes, and trust
   pages so AI crawlers get a clean map. (New — see sprint plan.)
9. **No false precision, no guarantees.** Ranges with a checked date beat fake exactness.
   Never use guaranteed-placement / guaranteed-visa language (also our scam-edge).
10. **Multi-modal.** At least one on-page visual per page (cost chart, timeline, route
    image with descriptive alt) — multi-modal pages see ~156% higher AI selection. The OG
    image is a social card, not on-page multimodal.

*(Named-expert/Person authorship is the highest-impact E-E-A-T lever but is **deferred** —
decision 2026-05-28 keeps the Organization author. See `05-editorial-geo-standard.md`.)*

## Technical baseline (confirmed against the code)

- **AI crawlers are already allowed.** `app/robots.ts` uses `userAgent: '*', allow: '/'`
  with only `/admin`, `/api/`, `/members/` disallowed — so GPTBot, OAI-SearchBot,
  ClaudeBot, PerplexityBot can all read public content. No change needed. (If we ever want
  to block training-only crawlers like CCBot while keeping search crawlers, do it
  explicitly.)
- **SSR is in place.** Pages are App-Router server components (e.g. `app/pathways/...`),
  so content is server-rendered — critical because AI crawlers don't execute JS. Route
  pages must stay server-rendered (no client-only content for the answer body).
- **Schema gap to close:** blog/pathways emit `Article` + `Organization` + `WebPage`
  (blog also `FAQPage`), but **no `BreadcrumbList`** anywhere. Route pages should add it.
  (Author stays `Organization`; `Person` deferred.)

## Off-page: brand mentions (the highest-leverage GEO lever)

The `seo-geo` data is blunt: **brand mentions correlate ~3× more strongly with AI
visibility than backlinks** (Ahrefs, 75k brands). And the surfaces differ by engine:

| Engine | Leans on | Implication for us |
|---|---|---|
| Google AI Overviews | Top-10 ranking pages (92%) | On-page passages + classic SEO (the route/blog work above) |
| ChatGPT search | Wikipedia (~48%), Reddit (~11%) | Entity presence + authoritative mentions |
| Perplexity | Reddit (~47%), Wikipedia | **Community validation — Reddit matters enormously** |

So on-page work alone wins AI Overviews but under-serves ChatGPT/Perplexity. A parallel
**brand-mention workstream** is needed — and we already have the tooling:

- **Reddit** (r/southafrica, r/askSouthAfrica, r/expats) — genuine, helpful answers that
  mention Jobabroad where relevant. Highest leverage for Perplexity/ChatGPT. (Reddit MCP
  is configured; the project rule already points there for voice-of-customer.)
- **LinkedIn** — John posting work-abroad guidance (the `ydcoza-linkedin-*` skills exist).
- **YouTube** — short explainer videos per top route (strongest single correlation, ~0.74).
- **Wikidata / entity** — establish a clean Jobabroad entity with `sameAs` links.

This is a separate operating track from content production; flag it as a Sprint 2+ lever,
not a blocker for shipping route pages.

## Product dependency: finalise all category flows to match the teaching flow

**Open item (added 2026-05-28):** the content layer now spans all 11 categories (pathways,
routes, comparisons), but the **paid-tier funnel is only fully built for teaching**. The
scoring rubric exists only at `lib/scoring/rubrics/teaching.json` (others return null), and
the personalised paid report / score flow is a **teaching-only pilot** (see CLAUDE.md). So we
are driving traffic across every category, while only teaching can currently complete the
full **assessment → score → paid report** journey end to end.

**What this means for the roadmap:** before (or as) we scale traffic to the non-teaching
categories, the **per-category flows must be finalised to match the teaching flow** — i.e.
each category needs its own scoring rubric, score-page logic, and report content so a
healthcare/trades/IT/etc. user gets the same complete experience a teaching user does. Until
then, treat non-teaching route/pathway pages as **top-of-funnel lead capture** (free
eligibility check + nurture), not as a complete paid journey, and prioritise building out the
category flows in step with whichever categories the content is actually pulling traffic for.

## KPIs

- **Leading:** route pages published & verified; % of pages passing the editorial
  checklist; internal links per page (target 5–8).
- **Search:** impressions & clicks per route cluster (Search Console); AI-citation
  appearances (spot-check AI Overviews / Perplexity for target queries).
- **Commercial:** free eligibility checks started from route pages; R495 conversions.

**Measurement loop:** publish a cluster → wait for Search Console impressions → expand
the clusters that get traction (by adding adjacent roles/countries or the matching
comparison page) → ignore the ones that don't. Do not pre-build all 120.
