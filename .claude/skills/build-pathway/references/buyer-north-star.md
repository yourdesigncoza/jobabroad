# Buyer North Star — Build Pathway Skill

**Read this before every stage that generates or reviews content.**

## Who the buyer is

A South African professional — degree-qualified, registered with their SA professional body, employed or recently employed in their field — who is seriously considering working abroad. They have done some Googling. They are worried about being scammed. They do not know which country is the best fit. They need honest, SA-specific advice, not generic immigration information they could find themselves.

They paid R199. They expect more than a blog post. They expect a field guide written for someone exactly like them.

## The six questions the guide must answer

Every section of the guide exists to answer one of these questions. If a section does not answer its question clearly and honestly, it has failed — regardless of how factually correct it is.

| Section | The buyer's question |
|---|---|
| 1. Destination Options | "Where should I actually go? Be honest — which countries are realistic for someone with my qualifications?" |
| 2. Document Checklist | "What do I need to prepare, in what order, and how long will it take? What will trip me up?" |
| 3. Realistic Costs | "How much money do I actually need? What's the total outlay before my first salary?" |
| 4. Visa Routes | "Which visa do I apply for? Is there a PR pathway? What are the real requirements for an SA passport holder?" |
| 5. Scam Red Flags | "How do I know if I'm being scammed? What do the real warning signs look like in this specific field?" |
| 6. Legitimate Contacts | "Who can I actually trust? Give me names, URLs, and tell me what they cost." |

## Quality bar: what "good" looks like

A guide section passes if a buyer can finish reading it and know **exactly what to do next**. It fails if:
- It gives information the buyer already knows from Google
- It hedges everything with "please consult a professional" without giving any concrete guidance
- It covers a destination or route so shallowly that the information could mislead rather than help
- It lists facts but does not rank, compare, or give a recommendation
- It describes what is theoretically possible without noting SA-specific barriers

## Scope discipline

Every category has primary destinations and out-of-scope destinations. Before spending research effort on a destination:

1. Check whether the category brief identifies it as primary, secondary, or out-of-scope
2. If secondary: give an honest 1–2 paragraph assessment with the key barriers, then stop
3. If out-of-scope: one sentence acknowledging it exists, one sentence explaining why it is not covered

**Never produce a shallow half-coverage on a complex destination.** Shallow coverage is worse than no coverage — it creates false confidence.

## Source integrity — HARD RULE

**This project is built on verified truth. A wrong fact with a confident citation is worse than no fact at all.**

### The single-source rule

A factual claim — fee amount, validity period, visa requirement, regulatory process, URL — may only be applied to the guide if it is verified by **at least one primary source** (official government website, statutory regulator, or authoritative programme operator). 

**If a claim can only be found on a single non-primary source (blog, forum, content farm, aggregator, news article without primary citation), it must NOT be applied as fact.** It must be flagged as `<!-- TODO: human-review: unverified — only found on [site], could not confirm via primary source -->`.

### What counts as a primary source

- ✅ Government department websites (gov.uk, homeaffairs.gov.au, immigration.govt.nz, labour.gov.za, etc.)
- ✅ Statutory regulators (SACE, AITSL, Teaching Council NZ, DfE, AHPRA, NMC, etc.)
- ✅ Official programme operators cited in government guidance
- ❌ Immigration advice blogs, content aggregators, third-party "how to" sites, agency websites, forum posts
- ❌ Any site whose primary business is unrelated to the claim (e.g. a DStv subscription site with an immigration article)

### How to apply this during research and review

1. **Before using any number, date, or policy detail from a search result**: check the actual domain — is it a primary source?
2. **If the primary source page can be fetched**: fetch it and confirm the claim exists there
3. **If the primary source page is unavailable or the claim cannot be found there**: do not apply — flag as TODO
4. **If Gemini (or any reviewer) suggests a correction citing a non-primary source**: do not concede — defend the original or add a TODO flag
5. **One credible non-primary source + no primary source confirmation = unverified = flag it**

### The failure mode this rule prevents

A search snippet from an unrelated site may contain accurate-sounding information that is wrong, outdated, or confused with a different requirement. Example: a Nigerian DStv subscription platform published an article about QTS with a "3 months" claim that could not be verified on gov.uk — applying it would have put incorrect timing advice into the guide. The buyer paid for truth, not confident-sounding speculation.

## Intervention trigger

If at any stage the content being generated would not pass the quality bar above, pause and address the gap before continuing. This is more important than hitting deadlines or keeping the pipeline moving. A guide with one excellent section and one misleading section is a failed guide.

## How this file is used

- **Stage 2** (prompt generation): Read before writing prompts. Each prompt's Goal and Runtime rules must map directly to the buyer's question for that section.
- **Stage 4** (synthesis): Each teammate reads the buyer's question for their section and the quality bar before writing. The guide section must be answerable, not just accurate.
- **Stage 5** (Gemini review): Each section is reviewed against the buyer's question first, factual accuracy second. A correct but unhelpful section must be revised.
