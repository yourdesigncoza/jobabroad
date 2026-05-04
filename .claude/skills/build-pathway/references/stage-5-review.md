# Stage 5 — Gemini Review Per Section

**Entry condition:** `current_stage: 5` (or auto-advancing from stage 4.5).
**Purpose:** Send each H2 section to Gemini-2.5-pro for adversarial factual review. Apply corrections. Mark disputed claims for human review.

## 1. Mark in-progress

Update state:
```yaml
current_stage: 5
stage_status: in_progress
last_run_at: <now>
```
Append to run log: `- <datetime> — Stage 5 started`

## 2. Read the guide

Read `docs/guides/<category>.md`. Parse the 6 H2 sections. The section boundaries are the `## ` headings.

## 3. Review each section (sequential — 1 through 6)

For each section where `state.gemini_review_status[i].status != completed`:

### 3a. Build the Gemini prompt

Construct a structured review prompt:

```
## Objective
Factual review of one section of a pathway guide for South African professionals considering working abroad.
This section covers: {{SECTION_HEADING}}

## Current state
This section was generated from research vaults built from primary government and regulatory sources.
The guide is intended for South African {{PROFESSION}} who are researching a move to {{DESTINATIONS}}.

## Proposed approach (the section content to review)
{{FULL_SECTION_TEXT}}

## Claude's reasoning
This content was synthesised from vault research against the sources listed in the citations.
The section was authored to answer the buyer question: "{{BUYER_QUESTION}}"
Key trade-offs: breadth vs. depth for a non-specialist audience; practical over comprehensive.

## Specific weak points to review
1. Does this section answer the buyer's question clearly enough that they know exactly what to do next?
2. Are all cited government/regulatory URLs active and pointing to the correct pages?
3. Are visa fee amounts, salary thresholds, and occupation-list statuses current (within 12 months)?
4. Are any routes described as open that are known to be closed or under review?
5. Are there important destinations, routes, or documents missing for this profession?
6. Are any claims about the SA regulatory body ({{SA_REGULATOR}}) incorrect?
7. Does any destination or route receive coverage so shallow it could mislead rather than inform?

## Instruction
Review this section for buyer usefulness AND factual accuracy. Focus on:
1. Whether the buyer's question is actually answered — not just addressed, but answered with enough specificity that the buyer knows their next step
2. Incorrect or outdated facts (visa fees, salary thresholds, route closures, regulatory requirements)
3. Missing critical information that a professional starting this process would need
4. Misleading framing (overly optimistic timelines, understated costs, shallow coverage of a complex destination)
5. Incorrect regulatory body names or processes

Structure your response under: Agreements, Disagreements, Blind Spots, New Ideas.
Be specific — cite the exact sentence or claim you are challenging and provide the correct information with a source if possible.
```

Fill in: `{{SECTION_HEADING}}`, `{{PROFESSION}}`, `{{DESTINATIONS}}` (from brief), `{{FULL_SECTION_TEXT}}`, `{{BUYER_QUESTION}}`, `{{SA_REGULATOR}}` (from brief).

### 3b. Call Gemini

Use `mcp__gemini-cli__ask-gemini` with `model: "gemini-2.5-pro"` and the prompt above.

If the tool returns an empty response or an error, retry up to 3× (transient). If all 3 fail, add a `<!-- TODO: human-review: gemini failed to respond for this section -->` marker at the start of the section and mark `status: completed` — do not block the pipeline.

### 3c. Parse Gemini's response

Separate into:
- **Agreements** — set aside, report as-is
- **Disagreements** — enter adversarial resolution loop (step 3d)
- **Blind Spots** — apply if clearly correct; otherwise add as `<!-- TODO: human-review: <blind spot> -->`
- **New Ideas** — apply if clearly an addition and not a structural change; otherwise add as `<!-- TODO: human-review: <new idea> -->`

### 3d. Resolution loop (for each Disagreement only)

**Hard cap: 2 exchanges per disagreement, 4 total per section.**

For each disagreement:

1. Evaluate Gemini's challenge:
   - **Concede** if Gemini cites a primary source and the claim in the guide is clearly wrong or outdated.
   - **Defend** if the guide's claim is sourced and Gemini's challenge is generic or lacks a citation.
   - **Synthesize** if both positions have merit (e.g. the guide says X, Gemini says it's now Y — include both with date context).

2. If conceding or synthesizing: apply the correction to the guide section directly.

3. If defending: send one follow-up to Gemini with the counter-position:
   ```
   The guide states: "<exact claim>"
   Source: <url>
   Your challenge: "<Gemini's challenge>"
   Counter-position: <Claude's counter with reasoning>
   Request: Does this source satisfy your concern, or do you have a primary source that contradicts it?
   ```
   Use `mcp__gemini-cli__ask-gemini` for this follow-up.

4. After the follow-up:
   - If Gemini accepts or provides no stronger source: **Defend** — keep the original claim.
   - If Gemini provides a contradicting primary source: **Concede** — apply correction.
   - Exchange cap reached: Claude makes the final call. Add `<!-- TODO: human-review: disputed — <summary> -->`.

### 3e. Apply corrections

**Source integrity check (mandatory before applying ANY correction):**

Before writing a correction to the guide, verify the corrected claim against a primary source:
- Primary sources: official government websites, statutory regulator websites, official programme operators
- Non-primary sources: blogs, content aggregators, third-party "how to" sites, agency sites, forum posts, any site whose primary business is unrelated to the claim

**If the corrected claim can only be verified on a non-primary source: do NOT apply it. Add `<!-- TODO: human-review: unverified — Gemini suggested [claim] but primary source confirmation not found -->` instead.**

Fetching the actual primary source page to confirm the claim is not optional — a search snippet is not verification.

Edit `docs/guides/<category>.md` in place. Make only the agreed corrections that pass the source integrity check above. For each disputed claim (after exhausting exchanges): add `<!-- TODO: human-review: <brief description of dispute> -->` immediately before the disputed sentence.

### 3f. Update state

```yaml
gemini_review_status[i]:
  status: completed
  exchanges_used: <total exchanges used>
  todo_flags: <count of <!-- TODO: human-review --> markers added>
```

Append to run log: `- <datetime> — Section <N> reviewed: <X exchanges, Y TODO flags>`

## 4. Mark completed and hard-exit

After all 6 sections are reviewed:

Update state:
```yaml
current_stage: 5
stage_status: completed
```

Count total `<!-- TODO: human-review -->` markers in the file.

Append to run log: `- <datetime> — Stage 5 complete: all sections reviewed`

Print:
```
✓ Stage 5 complete for <category>.
All 6 sections reviewed by Gemini-2.5-pro.
TODO flags for human review: <total count>
<If any> Sections with flags: <list sections with todo_flags > 0>

Run /build-pathway <category> to continue to stage 6 (publish).
```

Hard-exit.
