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
