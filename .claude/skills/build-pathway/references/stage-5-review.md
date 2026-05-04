# Stage 5 — Gemini Review Per Section

**Entry condition:** `current_stage: 5` (or auto-advancing from stage 4.5).
**Purpose:** (A) Audit claim markers for source integrity. (B) Send each H2 section to Gemini-2.5-pro for adversarial factual review. Apply corrections. Mark disputed claims for human review.

Record stage start time for RUN_REPORT.

## 1. Mark in-progress

Update state:
```yaml
current_stage: 5
stage_status: in_progress
last_run_at: <now>
```
Append to run log: `- <datetime> — Stage 5 started`

## 2. Read the guide

Read `docs/guides/<category>.md`. Verify `state.guide_hash` matches the SHA256 of the current file (re-compute). If mismatch: the guide has been modified outside the pipeline — write `stage_status: failed`, `last_error: "guide_hash mismatch — file modified externally"`, append to RUN_REPORT, hard-exit.

Parse the 6 H2 sections. Section boundaries are the `## ` headings.

## 3. Review each section (sequential — 1 through 6)

For each section where `state.gemini_review_status[i].status != completed`:

---

### Source-tier preface (apply before every decision in 3b–3e)

**Non-primary single-source rule:** If Gemini's only cited source for a disagreement is a non-primary site (blog, aggregator, immigration agency, content farm, "how-to" guide, any site whose primary business is unrelated to the claim), treat the disagreement as **Defend** regardless of confidence in Gemini's language. Plausible-but-fabricated non-primary URLs are a known Gemini failure mode. A non-primary source cannot override a sourced claim in the guide.

**Mode B source audit must complete before Mode A review begins (step 3a).**

---

### 3a. Mode B — Source audit (run FIRST, before Mode A)

Walk every `<!-- src:` claim marker in this section. For each marker:

1. Extract `url` and `tier` from the marker.
2. If `tier=unverified`: flag immediately — insert `<!-- TODO: human-review: unverified — claim_id=<slug> — no primary source confirmed -->` before the claim. Record in source_audit findings.
3. If `tier=primary` or `tier=secondary`:
   - Fetch the URL (using WebFetch). Allow up to 2 attempts.
   - If the page is unfetchable (404, login wall, redirect loop, timeout after 2 attempts) OR the fetched page does not contain any recognizable form of the claimed fact:
     - Insert `<!-- TODO: human-review: unverified — claim_id=<slug> — source <url> could not confirm claim -->` before the claim.
     - Record in source_audit findings. Do NOT remove the claim — mark it only.
   - If the page confirms the claim: no action needed.

Focus source audit on high-risk sections: costs (03), visa routes (04), contacts (06). For destinations (01), documents (02), scams (05) — audit only `tier=unverified` markers unless time permits full audit.

After Mode B: append source_audit findings to RUN_REPORT (see run-report.md format).

### 3b. Mode A — Build the Gemini prompt

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
1. Whether the buyer's question is actually answered with enough specificity that the buyer knows their next step
2. Incorrect or outdated facts (visa fees, salary thresholds, route closures, regulatory requirements)
3. Missing critical information that a professional starting this process would need
4. Misleading framing (overly optimistic timelines, understated costs, shallow coverage of a complex destination)
5. Incorrect regulatory body names or processes

Structure your response under: Agreements, Disagreements, Blind Spots, New Ideas.
Be specific — cite the exact sentence or claim you are challenging and provide the correct information with a source if possible.
```

Fill in: `{{SECTION_HEADING}}`, `{{PROFESSION}}`, `{{DESTINATIONS}}` (from brief), `{{FULL_SECTION_TEXT}}`, `{{BUYER_QUESTION}}`, `{{SA_REGULATOR}}` (from brief).

### 3c. Call Gemini

Use `mcp__gemini-cli__ask-gemini` with `model: "gemini-2.5-pro"` and the prompt above.

If the tool returns an empty response or an error, retry up to 3× (transient). If all 3 fail, add a `<!-- TODO: human-review: gemini failed to respond for this section -->` marker at the start of the section and mark `status: completed` — do not block the pipeline.

### 3d. Parse Gemini's response

Separate into:
- **Agreements** — set aside, report as-is
- **Disagreements** — enter adversarial resolution loop (step 3e)
- **Blind Spots** — apply if clearly correct and sourced; otherwise add as `<!-- TODO: human-review: <blind spot> -->`
- **New Ideas** — apply if clearly an addition and not a structural change; otherwise add as `<!-- TODO: human-review: <new idea> -->`

### 3e. Resolution loop (for each Disagreement)

**Hard cap: 2 exchanges per disagreement, 4 total per section.**

**Non-primary source check (apply first to each disagreement):**
If Gemini's cited source is non-primary (blog, aggregator, agency, content farm), apply **Defend** immediately — do not enter the exchange loop. Record this override in RUN_REPORT.

For each disagreement with a primary-or-unknown source:

1. Evaluate Gemini's challenge:
   - **Concede** if Gemini cites a primary source and the claim in the guide is clearly wrong or outdated.
   - **Defend** if the guide's claim is sourced and Gemini's challenge is generic or lacks a primary citation.
   - **Synthesize** if both positions have merit (include both with date context).

2. If conceding or synthesizing: apply the correction — but first complete the source integrity check in step 3f.

3. If defending: send one follow-up to Gemini:
   ```
   The guide states: "<exact claim>"
   Source: <url>
   Your challenge: "<Gemini's challenge>"
   Counter-position: <Claude's counter with reasoning>
   Request: Does this source satisfy your concern, or do you have a primary source that contradicts it?
   ```
   Use `mcp__gemini-cli__ask-gemini` for this follow-up.

4. After the follow-up:
   - Gemini accepts or no stronger source: **Defend** — keep the original.
   - Gemini provides contradicting primary source: **Concede** — apply correction (after step 3f check).
   - Exchange cap reached: Claude's final call. Add `<!-- TODO: human-review: disputed — <summary> -->`.

### 3f. Apply corrections — source integrity check (mandatory)

Before writing ANY correction:

1. Identify the primary source for the corrected claim.
   - Primary: official government websites, statutory regulator websites, official programme operators.
   - Non-primary: blogs, content aggregators, third-party "how to" sites, agency sites, forum posts.

2. If the corrected claim can only be verified on a non-primary source:
   - **Do NOT apply the correction.**
   - Add: `<!-- TODO: human-review: unverified — Gemini suggested [claim] but primary source confirmation not found -->`

3. If the primary source page is unfetchable (404, login wall, timeout after 2 attempts), or the page does not contain the claimed fact in any recognizable form:
   - **Do NOT apply the correction.**
   - Add: `<!-- TODO: human-review: unverified — Gemini cited [url] but page could not confirm [claim] -->`

4. If the correction passes: apply it by editing `docs/guides/<category>.md` in place. Update or add a `<!-- src:` marker for the corrected claim.

Fetching the actual primary source page is not optional — a search snippet is not verification.

### 3g. Update section review state

```yaml
gemini_review_status[i]:
  status: completed
  exchanges_used: <total exchanges used>
  todo_flags: <count of <!-- TODO: human-review --> markers added this section>
  reviewed_against_guide_hash: <state.guide_hash>
```

Append to run log: `- <datetime> — Section <N> reviewed: <X exchanges, Y TODO flags, Z source-audit flags>`

## 4. Mark completed and hard-exit

After all 6 sections are reviewed:

Update state:
```yaml
current_stage: 5
stage_status: completed
```

Count total `<!-- TODO: human-review -->` markers in the file. Re-compute SHA256 of the (now-corrected) guide; update `state.guide_hash` if it changed. Update any `reviewed_against_guide_hash` fields that are now stale (if the guide changed, mark those sections' `reviewed_against_guide_hash` to the new hash — since ALL sections were reviewed in this pass, they all reflect the corrected guide).

Append to RUN_REPORT: stage 5 success block with per-section exchange counts, TODO flags, and source-audit findings summary.

Append to run log: `- <datetime> — Stage 5 complete: all sections reviewed`

Print:
```
✓ Stage 5 complete for <category>.
All 6 sections reviewed by Gemini-2.5-pro.
TODO flags for human review: <total count>
<If any> Sections with flags: <list sections with todo_flags > 0>
RUN_REPORT: docs/prompts/<category>/RUN_REPORT.md

Run /build-pathway <category> to continue to stage 6 (publish).
```

Hard-exit.
