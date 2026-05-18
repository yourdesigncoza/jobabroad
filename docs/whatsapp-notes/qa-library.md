# Q&A Library

Reusable question-shape → reply-pattern → follow-up library. This is the corpus the future AI assistant should match against. Add a new entry every time a genuinely new question shape arrives. Variants of an existing shape go under "Variants" inside the matching entry.

Every entry follows the same schema:

- **Pattern name** — short slug (the `##` heading, human-facing)
- **ID** — stable `pat_<slug>` identifier on its own `**ID:**` line; the foreign key used by the side-car tool and conversation logs. Never rename — pattern names can drift, IDs cannot.
- **Question shapes** — example phrasings (the trigger surface)
- **Likely categories** — which jobabroad.co.za categories this maps to
- **Reply template** — general only, no specifics, follows the 4-line shape from `README.md`
- **Follow-up question** — the one qualifier we ask to deepen the profile
- **Upsell hook** — what we're hoping to surface to them later once they're registered (kept internal; never sent on WhatsApp)
- **Used by** — list of `conversations/<phone>.md` threads that have used this pattern

---

## matric-only, broad overseas enquiry

**ID:** pat_matric_first_touch

**Question shapes**
- "How do I get learnerships or jobs with only matric to work overseas"
- "I only have matric, can I work abroad?"
- "What overseas jobs can I do without a degree?"

**Likely categories:** `seasonal`, `au-pair`, `tefl`, `hospitality`

**Reply template**

> Hi! Matric is enough for a few overseas routes — the main ones are seasonal work, au pair, TEFL (teaching English), and hospitality. Each has its own pathway. Have a look at the categories on https://jobabroad.co.za and register on the one that fits — the full guide unlocks once you're in.
>
> Which of those four sounds closest to what you want?

**Follow-up question:** "Which of those four sounds closest to what you want?"

**Upsell hook (internal):** once registered + assessed, the R495 tier delivers a personalised report with recruiter shortlist, country-by-country requirements, and a one-on-one call.

**Used by:** `conversations/27739480122.md`

---

## category-confirmed: TEFL

**ID:** pat_tefl_confirmed

**Question shapes** (a one-word reply naming the category, usually after we offered a menu)
- "TEFL"
- "I want to do TEFL"
- "Teaching English"

**Likely categories:** `tefl`

**Reply template**

> Great choice — TEFL is one of the most accessible overseas routes with matric. The full TEFL pathway guide (what cert to get, where to apply, how the visa side works) is on https://jobabroad.co.za/register?category=tefl — register there and the guide opens up.
>
> Do you already have a TEFL certificate, or are you starting from scratch?

**Follow-up question:** "Do you already have a TEFL certificate, or are you starting from scratch?"

**Upsell hook (internal):** TEFL-certified candidates are highest-converting for R495 (ready to apply, just need country/school targeting). Non-certified candidates need the cert first — R495 report can include cert-provider shortlist + 90-day plan.

**Used by:** `conversations/27739480122.md`

---

## category-confirmed: hospitality

**ID:** pat_hospitality_confirmed

**Question shapes** (a one-word/short reply that effectively names hospitality as the route)
- "Hospitality"
- "Waiter assistant or general work"
- "Hotel work"
- "Bar / restaurant work overseas"

**Likely categories:** `hospitality`

**Reply template**

> Hospitality is a solid route for South Africans — passport, some experience and the right pathway makes it very doable. The full hospitality guide (which routes work for SA, what employers want, the visa side) is on https://jobabroad.co.za/register?category=hospitality — register there and the guide opens up.
>
> How much waitering or hotel experience do you have, and do you have a passport?

**Follow-up question:** "How much waitering or hotel experience do you have, and do you have a passport?"

**Upsell hook (internal):** experienced + passport-ready hospitality candidates are direct R495 converts (specific employer shortlist + visa walkthrough). Passport-less / no-experience candidates need a longer nurture before the upsell lands.

**Used by:** `conversations/27785807197.md`

---

## partial answer: transferable experience nudge

**ID:** pat_partial_transferable

**Question shapes** (replies that volunteer adjacent experience instead of answering the direct qualifier)
- "I used to have a small business where I used to sell at events"
- "I worked in retail for 3 years"
- "I've done a lot of customer service"
- "I helped my mom at her stall"

**Likely categories:** depends on the parent thread — keep the original category from the previous turn.

**Reply template** (hospitality-flavoured; adapt the parenthetical to whichever category)

> Thanks — [acknowledge the actual experience they shared, one short clause]. For [category] work overseas, most routes do want some direct [category]-specific experience alongside that. The full guide on https://jobabroad.co.za/register?category=<slug> covers which entry-level routes don't need formal experience — register and the guide opens.
>
> Two quick things: do you have any [direct experience the original question asked], and do you have a valid passport?

**Follow-up question:** re-ask the two qualifiers from the previous turn (whatever they skipped + passport if still unknown). These are the gate for further routing.

**Upsell hook (internal):** transferable-experience contacts are not direct R495 converts yet — they need the free guide to see the realistic entry-level routes. R495 lands once they confirm passport + commit to a route.

**Used by:** `conversations/27785807197.md`

---

## hospitality / waiter / general work (first-touch, broad)

**ID:** pat_hospitality_first_touch

**Question shapes**
- "Waiter assistant or general work"
- "I want to work in a hotel/restaurant overseas"
- "Bartender / barista jobs abroad"

**Likely categories:** `hospitality`, `seasonal`

**Reply template**

> Hi! For waiter and general work abroad, the routes that work for South Africans are hospitality and seasonal work. Both have full guides on https://jobabroad.co.za — register on the category that fits and the guide opens up.
>
> How much waitering experience do you have, and do you have a passport?

**Follow-up question:** "How much waitering experience do you have, and do you have a passport?"

**Upsell hook (internal):** assessment scores hospitality candidates on experience + passport + language; high scorers are the natural R495 conversion.

**Used by:** `conversations/27785807197.md`

---

## category-confirmed: teaching

**ID:** pat_teaching_confirmed

**Question shapes** (formal classroom teaching abroad — not TEFL/ESL)
- "Teaching"
- "I want to teach overseas"
- "I'm a teacher looking to work abroad"

**Likely categories:** `teaching`

**Reply template**

> Teaching abroad is a real route for qualified South African educators. The full teaching pathway guide (which qualifications travel best, what registration looks like, how the visa side works) is on https://jobabroad.co.za/register?category=teaching — register there and the guide opens up.
>
> What's your highest teaching qualification (B.Ed, PGCE, M.Ed)?

**Follow-up question:** "What's your highest teaching qualification (B.Ed, PGCE, M.Ed)?"

**Upsell hook (internal):** B.Ed + 2-3 years classroom experience = highest-converting teaching candidates. International school recruiters want SACE-registered teachers with proven track record.

**Used by:** _none yet_

---

## category-confirmed: healthcare

**ID:** pat_healthcare_confirmed

**Question shapes**
- "Healthcare / nursing"
- "I'm a nurse"
- "I want to do nursing overseas"
- "Healthcare jobs abroad"

**Likely categories:** `healthcare`

**Reply template**

> Healthcare is one of the strongest overseas routes for South Africans, especially nursing. The full healthcare pathway guide (qualifications recognition, registration steps, sponsorship routes) is on https://jobabroad.co.za/register?category=healthcare — register there and the guide opens up.
>
> What's your role and how many years of experience do you have?

**Follow-up question:** "What's your role and how many years of experience do you have?"

**Upsell hook (internal):** SANC-registered RNs with 2+ years post-grad experience are the highest-converting healthcare candidates — sponsorship routes are well-established.

**Used by:** _none yet_

---

## category-confirmed: trades

**ID:** pat_trades_confirmed

**Question shapes**
- "Trades"
- "I'm an electrician/plumber/welder"
- "I want to do trades work abroad"
- "Artisan jobs overseas"

**Likely categories:** `trades`

**Reply template**

> Trades are one of the most in-demand overseas routes for South Africans — skilled artisans are short everywhere. The full trades pathway guide (which trades travel, qualification recognition, sponsorship routes) is on https://jobabroad.co.za/register?category=trades — register there and the guide opens up.
>
> What trade are you in, and do you have a Red Seal or trade test certificate?

**Follow-up question:** "What trade are you in, and do you have a Red Seal or trade test certificate?"

**Upsell hook (internal):** Red Seal-certified artisans (esp. electricians, welders, fitters) with 3+ years experience are direct R495 converts — visa sponsorship is straightforward.

**Used by:** _none yet_

---

## category-confirmed: farming

**ID:** pat_farming_confirmed

**Question shapes**
- "Farming"
- "I want to do farm work abroad"
- "Agriculture / farming jobs overseas"
- "I worked on a farm and want to do that abroad"

**Likely categories:** `farming`

**Reply template**

> Farming is a solid first-overseas route — practical experience matters more than formal qualifications. The full farming pathway guide (which countries hire, what employers want, contract types) is on https://jobabroad.co.za/register?category=farming — register there and the guide opens up.
>
> Do you have prior farm work experience, and what type (livestock, crops, mixed)?

**Follow-up question:** "Do you have prior farm work experience, and what type (livestock, crops, mixed)?"

**Upsell hook (internal):** candidates with practical farm experience + driver's licence + machinery operation skills are direct R495 converts.

**Used by:** _none yet_

---

## category-confirmed: seasonal

**ID:** pat_seasonal_confirmed

**Question shapes**
- "Seasonal work"
- "I want short-term work abroad"
- "Fruit picking / packhouse jobs"
- "Summer work overseas"

**Likely categories:** `seasonal`

**Reply template**

> Seasonal work is one of the easiest first-time overseas routes — short contracts, clear visa pathways, no degree needed. The full seasonal pathway guide (which programmes work, timing, what to budget for) is on https://jobabroad.co.za/register?category=seasonal — register there and the guide opens up.
>
> Are you available for a full season (typically 6 months), and do you have a passport?

**Follow-up question:** "Are you available for a full season (typically 6 months), and do you have a passport?"

**Upsell hook (internal):** passport-ready candidates available for full season contracts are quick wins — programmes have defined application windows we can guide them through.

**Used by:** _none yet_

---

## category-confirmed: au-pair

**ID:** pat_au_pair_confirmed

**Question shapes**
- "Au pair"
- "I want to be an au pair"
- "Childcare work abroad"
- "Live-in nanny overseas"

**Likely categories:** `au-pair`

**Reply template**

> Au pair is a great route for young South Africans with childcare experience — many countries have dedicated visa programmes. The full au pair pathway guide (which countries, age limits, agency vs direct match) is on https://jobabroad.co.za/register?category=au-pair — register there and the guide opens up.
>
> Do you have prior childcare experience and a valid driver's licence?

**Follow-up question:** "Do you have prior childcare experience and a valid driver's licence?"

**Upsell hook (internal):** 20-26yo candidates with childcare experience + driver's licence are direct R495 converts — agency placement routes are well-defined.

**Used by:** _none yet_

---

## category-confirmed: accounting

**ID:** pat_accounting_confirmed

**Question shapes**
- "Accounting"
- "I'm an accountant"
- "Finance / accounting jobs abroad"
- "I want to do articles overseas"

**Likely categories:** `accounting`

**Reply template**

> Accounting is a strong overseas route for South Africans, especially with SAICA / SAIPA registration. The full accounting pathway guide (qualifications recognition, reciprocity agreements, sponsorship) is on https://jobabroad.co.za/register?category=accounting — register there and the guide opens up.
>
> What's your qualification status (SAICA/SAIPA articles complete, CA(SA), etc.) and years of experience?

**Follow-up question:** "What's your qualification status (SAICA/SAIPA articles complete, CA(SA), etc.) and years of experience?"

**Upsell hook (internal):** CA(SA)s with Big-4 experience are top-tier R495 converts — reciprocity routes (ICAEW, CPA) are clear-cut.

**Used by:** _none yet_

---

## category-confirmed: it-tech

**ID:** pat_it_tech_confirmed

**Question shapes**
- "IT / tech"
- "I'm a software developer"
- "DevOps / data / cloud jobs abroad"
- "Tech jobs overseas"

**Likely categories:** `it-tech`

**Reply template**

> IT and tech is the easiest overseas route for South Africans right now — remote-friendly employers and sponsorship visas are both well-established. The full IT pathway guide (which specialisms travel, sponsorship vs remote routes, salary ranges to expect) is on https://jobabroad.co.za/register?category=it-tech — register there and the guide opens up.
>
> What's your specialism (frontend, backend, DevOps, data, etc.) and years of experience?

**Follow-up question:** "What's your specialism (frontend, backend, DevOps, data, etc.) and years of experience?"

**Upsell hook (internal):** mid-to-senior devs (5+ yrs) with cloud or DevOps stack are direct R495 converts — sponsorship + remote pipelines both work.

**Used by:** _none yet_

---

## category-confirmed: engineering

**ID:** pat_engineering_confirmed

**Question shapes**
- "Engineering"
- "I'm an engineer"
- "Mech/civil/elec engineering jobs abroad"
- "I want to work as an engineer overseas"

**Likely categories:** `engineering`

**Reply template**

> Engineering is a strong overseas route — ECSA registration plus a recognised qualification travels well. The full engineering pathway guide (which disciplines are in demand, professional registration routes, sponsorship) is on https://jobabroad.co.za/register?category=engineering — register there and the guide opens up.
>
> What's your discipline (mechanical, civil, electrical, chemical, etc.) and are you Pr.Eng registered?

**Follow-up question:** "What's your discipline (mechanical, civil, electrical, chemical, etc.) and are you Pr.Eng registered?"

**Upsell hook (internal):** Pr.Eng engineers with 5+ years industry experience are direct R495 converts — reciprocity routes (Washington Accord, EUR ING) are well-established.

**Used by:** _none yet_
