# Stage 1 — Category Brief

**Entry condition:** `current_stage: 1` (or auto-advancing from stage 0).
**Purpose:** Research the category landscape and write `_BRIEF.md` — the source of truth for all prompts generated in stage 2.

## 1. Mark in-progress

Update state:
```yaml
current_stage: 1
stage_status: in_progress
last_run_at: <now>
```
Append to run log: `- <datetime> — Stage 1 started`

## 2. Read source material

Read these files in order. Extract and note the most relevant content for `<category>`.

### 2a. Pathway intelligence research
Read all of: `docs/pathway-intelligence-research.md`

Extract: which destinations are listed for the category, which shared-content nodes apply, any build-order dependencies.

### 2b. Market research wiki — overview
Read:
- `/home/laudes/zoot/projects/wiki-builds/work-abroad-pathway-intelligence/wiki/index.md`
- `/home/laudes/zoot/projects/wiki-builds/work-abroad-pathway-intelligence/wiki/Conclusion.md`

### 2c. Market research wiki — path-filtered subset
**Hard cap: 30 notes total across all subfolders.**

1. Check if `/home/laudes/zoot/projects/wiki-builds/work-abroad-pathway-intelligence/wiki/Occupation Pathways/<category-slug>/` exists.
   - If yes: read all notes in that directory (these are the most relevant).
   - `<category-slug>` is the category as written (engineering, it-tech, teaching, accounting).
2. From each of these wiki subfolders, read the 5 most recently modified `.md` files:
   - `Countries/`
   - `Visa Routes/`
   - `Regulatory Constraints/`
   - `Scam Patterns/`
   Use `ls -t "<folder>"/*.md 2>/dev/null | head -5` to get the most recent.
3. Stop reading when the 30-note cap is reached.

### 2d. Web research
Use `mcp__brave-search__brave_web_search` with up to 3 queries. Choose the most targeted:
- `"<category> South Africa work abroad visa 2025"`
- `"South African <profession> emigrate to <top_destination> requirements"`
- `"<destination_regulator> South Africa recognition <profession>"`

## 3. Write _BRIEF.md

Read the template at `.claude/skills/build-pathway/templates/BRIEF.md.tpl`.

Fill in all `{{PLACEHOLDER}}` fields using the researched material. Be specific and factual:
- **Time period:** state the year(s) this data covers (e.g. "2025–2026, as of May 2026").
- **Destination shortlist:** 3–5 countries only. Include current demand signal (skills shortage, occupation list, bilateral agreement).
- **Regulators:** full official names. SA body by abbreviation + full name.
- **Visa routes:** exact visa/permit name as used in official government documents. Status must be current.
- **Scam patterns:** category-specific, not generic.
- **Key sources:** list actual domain names the prompts should whitelist (e.g. `ahpra.gov.au`, `engineeringcouncil.co.za`).
- **Prompt notes:** flag any date-sensitive data, closed routes, or confirmed facts the vault prompts must check.

Write to: `docs/prompts/<category>/_BRIEF.md`

## 4. Transition to Stage 2

Update state:
```yaml
current_stage: 1
stage_status: completed
brief_path: "docs/prompts/<category>/_BRIEF.md"
```
Append to run log: `- <datetime> — Stage 1 complete: brief written at docs/prompts/<category>/_BRIEF.md`

**Auto-advance:** Do NOT hard-exit. Immediately proceed to Stage 2 handler (`stage-2-prompts.md`).
