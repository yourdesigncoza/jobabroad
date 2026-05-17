# Rapid-fire suggestions — 2026-05-17

User firing items, I'm capturing. Implementation happens in batches once they say "go".

---

## 1. Dashboard cards open in new tab

> "These links should open in a new window" *(re: VETTED RECRUITERS + SCAM WARNINGS cards on /dashboard)*

**Read:** the two grey reference cards on the dashboard (`/recruiters` and `/scam-warnings`) should open in a new tab so users don't lose their place in the dashboard.

**Note:** these are internal links — the CLAUDE.md "external links → new tab" rule doesn't auto-apply. Need explicit `target="_blank" rel="noopener"` on the `<Card>` component or the specific dashboard usages.

**Scope:** likely also extend to the Teaching guide + Eligibility assessment cards? Or just these two reference cards? Defaulting to "just these two" until clarified — assessment + guide are the primary flow, you probably want them in-tab.

---

## 2. "Start Here" banner on Teaching Guide card

> "add a banner top left on this card that says 'Start Here'" *(re: Teaching Guide card on /dashboard)*

**Read:** add a corner ribbon / pill / tab in the top-left of the Teaching Guide card so first-time users know where to enter the flow.

**Implementation:** `Card` component doesn't currently accept a badge prop — add an optional `badge?: { label: string; tone: 'orange' | 'green' }` (or similar). Apply only to the Teaching Guide card.

**Defaulting to:** orange (#ff751f) for high attention — the existing top accent line on this card is already green, so an orange banner pops more. Pill shape (rounded), top-left, sitting on the card edge.

---

## 3. Reset Password link doesn't "load"

> "When I click on 'reset ...' it does not 'load'" *(re: RESET PASSWORD link on /dashboard, below Log out button)*

**Read:** clicking the orange "RESET PASSWORD" link from the dashboard appears to do nothing (or no visible change).

**Quick diag:** `/forgot-password` returns 200 server-side, page renders fine in isolation. Possible causes:
- Both pages share SiteNav so the visual change is subtle — user may think nothing happened
- Client-side nav swallowing an error
- The link target is correct (`href="/forgot-password"`) so it's not a wrong-URL bug

**Plan when implementing:** verify in browser via Playwright MCP that click → URL changes → form renders. If yes, the UX issue is "looks identical to dashboard"; fix with stronger visual differentiation on /forgot-password (e.g. drop SiteNav, use a focused single-purpose layout like the login form has).

---

## 4. Remove WhatsApp link from assessment steps

> "We don't need this link to Whatsapp" *(re: "Not sure about your SACE details? WhatsApp us." on assessment)*

**Read:** kill the `step.supportHint` → WhatsApp link rendering in `components/AssessmentStep.tsx:163`. Aligns with the broader "WhatsApp hidden for paid users / manual flow phased out" direction.

**Scope:** the supportHint pattern is shared across categories — teaching (SACE), healthcare (SANC, English test), trades (5 uses). Removing the render in AssessmentStep.tsx kills them all in one go. **Defaulting to: remove rendering only**, leave the `supportHint` strings on the step definitions in case we repurpose them later as inline tooltips/copy.

---

## 5. "(select all)" is misleading

> "Select all does nothing, or else reword saying You can select all" *(re: multiselect labels in assessment)*

**Read:** the label `(select all)` reads like a button promise. There's no button — it means "select all that apply." Rename across the board.

**Scope:** 22 occurrences across 10 category step files. One file already uses the correct form: healthcare.ts:37 says `(select all that apply)`. Easy sed-style fix: `(select all)` → `(select all that apply)`. The variant `(select all that work for you)` in farming.ts:230 is already correct and stays.

---

## 6. Highlight the 15-min call on the paywall card

> "this section looks good, but I do feel the 15 minute review call is not 'highlighted', it's just part of a 'list' (bland) ... it's kinda a big selling point" *(re: paywall card on /score)*

**Read:** the call is buried as bullet #3 of 4 on `components/ScoreResult.tsx:168`. It's the single biggest reason someone pays (human contact, "someone is checking my case"). Needs visual lift so it doesn't read as commodity.

**Defaulting to:** pull the call line OUT of the bullet list into its own highlight block above/inside the bullets — a small gold-accent panel with a phone icon, kicker text "Includes a live call", and the line "15-minute review call to talk through your plan." The remaining 3 bullets stay as features. Exact treatment TBD when implementing — I'll show you a screenshot before committing.

---

## 7. Rework the /score page — current version feels scammy

> "The user has gone through the form, gone through all the information, and you give out your score, but the score should really give the percentage score that we have in the PDF — say a 65 out of a hundred, prominently displayed. NEEDS PREP. These sections should add more value. It just feels bland once you've done all the work to complete the form, and you just get your score. There's no score, and immediately a premium upsell below — it looks like it's a scam. It looks scammy, this page. Rework the score page, add the score we had earlier in the PDF. WHAT'S WORKING — build out on that. BIGGEST BLOCKER — build out on that. Also email this section to the user because we have the email address. Mimic the final score page in an email and send it. If they go away from the website at least they have a copy in mail. Drip mail later, but for now this page is not going to work, it's just not enough."

**Read:** the current free score page is a thin teaser sandwiched between a tiny band pill and an aggressive R495 upsell. Voice intent: rebuild it into a real, substantive deliverable that earns trust before any pitch.

**Concrete requirements:**

1. **Numeric score, prominent** — same `score.overall` value as the PDF. Visual treatment like the PDF cover: large orange number, `/ 100` in ink. Band pill alongside (NEEDS PREP, etc.).
2. **Expanded "What's working"** — currently 1 sentence. Generate 2-3 sentences via the same LLM path the PDF uses (`generateWhatsWorking`). Give them something to feel good about.
3. **Expanded "Biggest blocker"** — same treatment. 2-3 sentences. Make the problem concrete.
4. **(Probable add)** dimension breakdown bars from the PDF, so the user sees WHICH areas are strong vs weak. Currently the PDF has these — surface them on the page too.
5. **Email the page content** to the user on assessment submission. Mimic the page layout in HTML. Subject something like "Your Teaching eligibility score: 65/100 (Needs prep)". Sender = jobabroad. Becomes the seed for future drip mail.
6. **Then** the R495 upsell — but lower on the page, no longer the immediate next thing the eye hits after the band pill.

**Why scammy now:** dark-pattern scent comes from (a) almost no free content, (b) immediate paywall, (c) no numeric anchor, (d) no email record. Fixing all four removes the scent.

**Scope:** this is the biggest item so far. Affects `components/ScoreResult.tsx` (page rebuild), `app/api/assessment/submit/route.ts` (trigger score email), a new `lib/notifications/score-email.ts` (mimics page in HTML), and possibly extracts `generateWhatsWorking` / `generateWhatsBlocking` from the PDF generator so they're callable from the score-page render path too (today they're embedded in `generateReport`).

**Email timing (decided):** send the email the FIRST TIME the /score page is loaded, not on assessment submission. Subsequent visits don't re-send. Track via a new timestamp column (likely `score_email_sent_at` on `assessments` or `profiles`); render the page, fire-and-forget the email if null, set the timestamp. This way:
- We only email users who actually reached /score (engaged, present)
- Re-submissions or re-visits don't spam
- If they bounce off without visiting /score, no email — which is correct (they didn't engage)

---

## 8. Dashboard ↔ Score page round-trip

> "When the user has completed the assessment form and the score page has been created, when you go back to the dashboard, there needs to be a link that says 'return to score page' or 'visit score page'. Also, at the bottom of the score page there's a back to dashboard link, which is great. So when you go back to your dashboard, you should be able to get back to the score page."

**Read:** today the dashboard's Eligibility Assessment card always points at `/assessment` (the form), regardless of whether the user has already submitted. After submission they should be able to revisit `/score` — the form is done, they want the result page back.

**Implementation:** in `app/dashboard/page.tsx`, check if the user's latest assessment is `status='submitted'`. If yes:
- Change the Eligibility Assessment card title/body to "View your score" / "See your eligibility band, what's working, and your top blocker."
- Change the href to `/members/${category}/score`
- (Probable add) keep a small inline link to "Retake assessment" → `/assessment` for users who want to redo

If no (draft or not started), card stays as-is (current behaviour).

**Pairs naturally with #7** — that rework + this navigation are both about treating the score page as a real destination rather than a one-shot teaser.

---

# Batch 2 (post-deploy)

## 9. Footer "Free resources" → eligibility-check CTA

> "Update this section: Complete a free Personalised Eligibility Check To Get Access To our list of Preferred Recruiters and Agencies" *(re: footer "Free resources" section showing Recruiters & agencies / Scam warnings / Privacy policy)*

**Read:** turn the footer column from a list of links into a single value-exchange CTA. Stops advertising direct access to /recruiters from the public footer (continuing the gradual phase-out per the existing [[project_outreach_scope]] / "recruiters page eventually private" stance).

**Implementation:**
- Replace the "Recruiters & agencies" link with the CTA copy + a button/link to `/register?next=/members/teaching/assessment` (or `/login` if already signed up).
- Keep "Privacy policy" — required for legal/cookie reasons, never gate behind anything.
- **Scam warnings:** keep or drop? It's a real safety resource that has SEO + safety value. Defaulting to **keep** as a separate item below the CTA (still free, visible to all).

**Default layout:**
```
GET STARTED
Complete a free Personalised Eligibility Check
to access our preferred recruiters and agencies.
[Start your check →]

Scam warnings
Privacy policy
```

**Question (defer if you say so):** is signed-in user behaviour different? A logged-in user clicking the CTA should go straight to `/members/<category>/assessment`, not the register flow. Defaulting to: link target is `/dashboard` for everyone, since middleware will route them appropriately.

---

## 10. Rethink "Work Abroad Playbook" tile (step 3 on landing)

> "Let's rethink this section, sure it's free ... but not anything" *(re: HowItWorks step 3 "Work Abroad Playbook" tile on landing page)*

**Read:** the tile leans hard on "Free" three times (tagline + sub-line + pill) but undersells the actual product. After today's score-page rebuild, the free tier delivers real value: numeric score, dimension bars, narrative paragraphs, emailed copy. The R495 tier is a step up, not the only paid thing. Today's tile mostly says "free" without showing what you GET free vs what's gated.

**Current copy:**
- Title: Work Abroad Playbook
- Sub: Researched, up to date, and built around the questions scam recruiters hope you never ask.
- Centred line: Free access. No monthly fees, no hidden costs.
- Pill: **Free** after registration

**Proposed shape (default — confirm or redirect):** convert the tile from "playbook = free thing" into a tier teaser that mirrors the real product:

```
Title: Your work-abroad plan, two ways
Sub:   Start with the free eligibility check + pathway guide.
       Upgrade for a personalised plan and a live review call.

— Free, after registration —
✓ Personalised eligibility score (5 dimensions)
✓ Country-by-country pathway guide
✓ Recruiter list + scam warnings

— R495 one-off, optional —
✓ Personalised PDF action plan
✓ 15-minute review call
✓ Vetted partner recommendations

[Get started free →]
```

**Alternative — minimal patch:** keep current shape, just fix the value claim. Title stays "Work Abroad Playbook", sub gains "Personalised eligibility check + full pathway guide. R495 unlocks a live review call and your personalised action plan." Pill drops to a single "Free after registration" or "From free".

**Question:** which direction — full two-tier reframe (default), minimal patch (faster), or something else? I'll mock either before committing.

---

## 11. Drop ", Free, no payment." from step 1

> "remove free" *(re: HowItWorks step 1 "Pick your field")*

**Read:** trivial copy fix. `components/HowItWorks.tsx:6` ends with ", Free, no payment." — strip those two clauses. Description becomes:
> "Tap a category tile, register with email + SA mobile, and pick the pathway that fits you."

**Pairs with #10:** part of the same "stop over-claiming free" theme. Could fold into the same commit when #10 lands.

---

## 12. Landing hero blurb — "Playbook is free" no longer rings true

> "this does not ring true anymore, we have an upsell" *(re: gold paragraph below the hero on /, app/page.tsx:127)*

**Read:** same "free is overclaimed" theme as #10 and #11. Current paragraph:
> "The Work Abroad Playbook is free. Register, confirm your email, and your guide unlocks immediately.
> No monthly fees, no hidden costs. No fake recruiter taking R5,000 from you."

The "is free" + "no monthly fees, no hidden costs" + then R495 upsell elsewhere = inconsistent positioning. The "no fake recruiter taking R5,000" line is still valuable (anti-scam differentiator), so keep that flavour.

**Proposed copy (default):**
> "The pathway guide + eligibility check are free. Register, confirm your email, and your guide unlocks immediately.
> The R495 upgrade adds a 15-min review call and your personalised action plan. No subscriptions. No fake recruiter taking R5,000 from you."

**Pairs with #10 + #11:** all three are one coherent "stop over-claiming free, position the two-tier product honestly" pass. Fold into one commit.

---

## 13. FAQ "Is it really free?" — rewrite honestly

> "rething & rewrite this section" *(re: FAQ first question on landing page)*

**Read:** the answer says "Yes." flatly, then lists "destination options, document checklist, realistic costs, ... and a personalised eligibility check" as all included free. Now misleading: the personalised PDF action plan + live call are the R495 product. Rewriting needs to:
1. Honestly split what's free vs paid
2. Not lose the "we don't pull a hidden charge" reassurance (that's the real worry behind the question)
3. Strip the em-dash (`—`) in the current copy, per project voice rules

**Source:** `components/FAQ.tsx:24-26`

**Proposed rewrite (default):**

```
Q: What's free, and what costs money?

A: The pathway guide and the personalised eligibility check are
   completely free, no card, no monthly fees. Register, confirm
   your email, and you're in. Inside the free tier: destination
   options, document checklist, realistic costs, visa route
   overview, scam red flags, recruiter list, and a personalised
   eligibility score.

   The R495 upgrade is optional. It adds a 15-minute review call
   and a personalised action plan written specifically for your
   situation. One-off payment, no subscription.
```

**Why rephrase the Q too:** "Is it really free?" with a partial-yes answer reads evasive. "What's free, and what costs money?" lets you answer plainly.

**Pairs with #10 + #11 + #12:** four-part honest-pricing pass on the landing page. All folded into one commit.

---

## 14. Privacy policy doesn't belong under "Free Resources"

> "Privacy policy should not be under 'Free Resources'" *(re: footer left column)*

**Read:** taxonomy fix. Privacy policy is a legal requirement, not a resource. Move it to its own grouping.

**Pairs with #9** — both reshape the footer's left column. Folding into the same footer-restructure commit.

**Default footer layout after #9 + #14 land together:**

```
GET STARTED                            ACCOUNT             LEGAL
Complete a free Personalised           Dashboard           Privacy policy
Eligibility Check to access            Log out
our preferred recruiters
and agencies.
[Start your check →]

Scam warnings
```

- The Get Started column carries the CTA + Scam warnings (which is the only true "free safety resource" left).
- Account is unchanged.
- New Legal column hosts Privacy policy (and future ToS, Cookie policy, etc).

**Question:** keep Scam warnings in the Get Started column, OR move it to its own little "Safety" group, OR drop it from the footer entirely (it's still on /dashboard)? Defaulting to **keep where shown** (small, free, visible to all).

---

## 15. Band-aware upsell copy on /score

> "Rework: You've got the headline. The R495 upgrade adds depth: a personalised action plan written after a live call, not just another auto-generated summary." *(user wants the upsell to acknowledge each band: pass / fail / middle)*

**User's examples:**
- Pass: "We just presented you with the basic assessment. According to our assessment it seems you have a legitimate chance for work abroad. If you want to save time and go deeper into your profile assessment, we have a R495 upgrade..."
- Fail: "Unfortunately you don't seem to have a good profile for finding opportunities abroad. Not all is lost & if you need a rapid fire counselling, we have a R495 upgrade..."

**Read:** static one-size pitch reads wrong when the user's actual result is at either extreme. Band-aware copy speaks to the situation.

**Polished copy (3 variants, shipped):**

- **strong_potential** — *"You've got a real shot. Want to move faster?"* + "The headline says you're application-ready, but ready doesn't mean automatic. The R495 upgrade saves you time. We talk through your situation on a 15-minute call, then write a personalised action plan: which country to target first, which documents to apostille this week, which recruiters to actually contact. Tailored to you, not just another auto-generated summary."

- **needs_prep** — *"You've got potential. Now what?"* + "The gaps above are fixable, but they need a plan made in the right order. The R495 upgrade is that plan. We talk through your situation on a 15-minute call, then write a personalised action plan that closes those gaps without you spending money on the wrong things first. Made for your situation, not just another auto-generated summary."

- **high_blockers** — *"Not the result you wanted? Not the end of the road either."* + "The blockers above are real, but they're rarely permanent. The R495 upgrade gives you a clear next move. We talk through your situation on a 15-minute call, then write a personalised action plan: whether to close those gaps now or pivot to a different route, what NOT to spend money on, what's realistic in the next 12 months. Honest and specific to you, not just another auto-generated summary."

**Implementation:** `BAND_UPSELL: Record<Band, { heading, intro }>` lookup in `ScoreResult.tsx`. Same component, no new props. Renders the right variant based on the existing `band` prop.

---

## 16. Checkout button fails: "Couldn't start checkout: checkout_failed"

> "Add to rapid fire" *(re: clicking UNLOCK FOR R495 → error message "Couldn't start checkout: checkout_failed. Please try again.")*

**Read:** the `/api/payments/checkout` POST is returning a non-OK response or a body without `checkoutUrl`. The client surfaces whatever `error` the server returns; in this case the server is returning `error: 'checkout_failed'` (or no payload at all). Need to look at server logs / the route.

**Likely causes (in order):**
1. `PAYSTACK_SECRET_KEY` is wrong / missing for the current environment (server doesn't tell the user, just throws).
2. The signed-in test user's email is `score-test-teacher@example.com` — Paystack init MIGHT reject `@example.com` as invalid (TLDs/MX checks).
3. Webhook callback URL mismatch between local env and Paystack expectations.
4. Amount-cents mismatch (PRICE_CENTS=49500 hard-coded).

**Implementation when picking this up:**
- Look at the dev-server stdout for the actual error returned from Paystack's API.
- Surface the real reason to the client (sanitised — don't leak keys) so future failures show a useful message, not "checkout_failed".
- If it's the @example.com issue, that's a test-account quirk; real users won't hit it.

---

## 17. /score page kicker doesn't match the site-wide pattern

> "Add orange sub-header, we have to be consistent" *(re: /score page shows "TEACHING ELIGIBILITY" in plain gold text vs the dashboard's orange dash + "YOUR ACCOUNT" pattern)*

**Read:** every other page on the site uses the same kicker structure — a small horizontal orange dash + orange uppercase text — established in `app/page.tsx`, `app/dashboard/page.tsx`, `app/login/page.tsx`, `app/register/page.tsx`, `app/recruiters/page.tsx`, `app/scam-warnings/page.tsx`, `/forgot-password`, `/reset-password`, etc. The /score page kicker (`components/ScoreResult.tsx:121`) is the lone exception: no dash, gold colour instead of orange.

**Source:** `components/ScoreResult.tsx:118-126` — the kicker is currently just a `<p>TEACHING ELIGIBILITY</p>` in gold.

**Fix:** wrap in the standard div-with-dash structure used everywhere else:
```tsx
<div className="flex items-center gap-3">
  <div className="w-8 h-px" style={{ backgroundColor: '#ff751f' }} />
  <span
    className="font-display text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.08em] md:tracking-[0.2em]"
    style={{ color: '#ff751f' }}
  >
    {categoryLabel} eligibility
  </span>
</div>
```

Trivial. Could also extract the pattern into a shared `<Kicker>` component since it's now used in ~10 places, but that's a separate refactor — out of scope for this rapid-fire fix.

---

## 18. /score page is slow on every visit (no narrative cache)

> "when https://www.jobabroad.co.za/members/teaching/score loads it takes forever, it seems like the page (score) is not cached"

**Read:** every /score page render kicks off TWO OpenAI calls in parallel (`generateWhatsWorking` + `generateWhatsBlocking`, both gpt-4o-mini, each typically 3–8s). The score itself is fast (deterministic rubric), but the narratives are the latency culprit. They don't change between visits — once the assessment is submitted, the answers are frozen, so the narrative is stable.

**Why not cached today:** the narratives were originally only generated inside the PDF flow (which is rare and intentional). The /score rebuild (item #7/#16 yesterday) put the same calls on the hot path of an HTML page that users actually revisit.

**Fix (when picked up):**
1. **Add `cached_narratives JSONB` column** to `assessments` (or a sibling `score_cache` table).
2. **Cache key = the submitted assessment id.** Once `status='submitted'`, the answers are immutable until the user re-submits, so the cache never goes stale unsafely.
3. **/score page logic:**
   - If `assessment.cached_narratives` is non-null → use it directly (sub-100ms render).
   - Else → call LLM, write back, render.
4. **Re-submission invalidation:** the wizard's submit path already creates a new assessment row (or flips back to draft then submits again). On submit, set `cached_narratives = null` so the next /score load regenerates.

**Bonus optimisation (cheap):** the score-email path also computes narratives. After this change, the email path becomes part of the same "generate or read cache" flow — even on first visit, the email send and the page render share one LLM call instead of competing for two.

**Defer to me on priority:** trivial migration, ~40 lines of generator change. Could fold into the same commit as #16 follow-up work.

---

## 19. needs_prep upsell — sharper "wrong order" hook (shipped)

> Updated to the user's polished version after they noted the original needs_prep variant explained the offer before creating desire.

**Shipped copy:**
- Heading: "Don't spend money in the wrong order."
- Intro: "Your score shows real potential, but one or two gaps could block your application if you deal with them too late. For R495, we review your situation on a 15-minute call and then write a personalised action plan showing what to fix first, which route looks most realistic, and what not to waste money on."

The hook now hits the real fear (wasting money in the wrong sequence) before pitching the solution. Closes without the "not just another auto-generated summary" tag — deliberate by the user; that phrase no longer earns its place in this variant.

**Flag for follow-up:** the strong_potential and high_blockers variants from #15 are now stylistically softer than this one. Worth a future pass to sharpen both in the same direction if you want consistent voice across all three bands.

---
