# Stage 2 — Prompt Generation

**Entry condition:** `current_stage: 2` (or auto-advancing from stage 1).
**Purpose:** Author 6 vault-builder prompts for this category — one per guide section.

## 1. Mark in-progress

Update state:
```yaml
current_stage: 2
stage_status: in_progress
last_run_at: <now>
```
Append to run log: `- <datetime> — Stage 2 started`

## 2. Load reference material

Read ALL of these before generating any prompts:

1. `.claude/skills/build-pathway/references/buyer-north-star.md` — **read first**. Every prompt must map to the buyer's question for its section. If a prompt would not help the buyer answer their question, it is wrong regardless of factual quality.
2. `docs/prompts/<category>/_BRIEF.md` — the category brief from stage 1
3. `docs/prompts/research-prompt.md` — the canonical fill-in template + its 13 LLM-fill rules (read every rule; they are mandatory)
4. `docs/guide-template.md` — the 6-section structure and what content each section must contain
5. All 6 nursing prompts as domain-style reference (read them for tone, schema detail level, source-constraint specificity, runtime-rules style):
   - `docs/prompts/nursing/01-destination-options.md`
   - `docs/prompts/nursing/02-document-checklist.md`
   - `docs/prompts/nursing/03-realistic-costs.md`
   - `docs/prompts/nursing/04-visa-routes.md`
   - `docs/prompts/nursing/05-scam-red-flags.md`
   - `docs/prompts/nursing/06-legitimate-contacts.md`

## 3. Generate 6 section prompts

For each section below, generate a prompt by copying the "send-ready" section of `docs/prompts/research-prompt.md` and filling every `[placeholder]` using the category brief and guide template.

**Section → prompt file mapping:**

| Section | Output file | vault-builder target |
|---|---|---|
| 1. Destination Options | `docs/prompts/<category>/01-destination-options.md` | `wa-<category>-01-destinations` |
| 2. Step-by-Step Document Checklist | `docs/prompts/<category>/02-document-checklist.md` | `wa-<category>-02-documents` |
| 3. Realistic Costs | `docs/prompts/<category>/03-realistic-costs.md` | `wa-<category>-03-costs` |
| 4. Visa Route Overview | `docs/prompts/<category>/04-visa-routes.md` | `wa-<category>-04-visa-routes` |
| 5. Scam Red Flags | `docs/prompts/<category>/05-scam-red-flags.md` | `wa-<category>-05-scams` |
| 6. Legitimate Contacts & Official Links | `docs/prompts/<category>/06-legitimate-contacts.md` | `wa-<category>-06-contacts` |

### Per-section filling rules

**Goal:** One precise sentence. Example: "Map all active visa routes and eligibility requirements for South African engineers seeking work permits in Australia, Canada, and the UK as of 2026."

**Seed entities:** 5 named entities. Use the brief's regulator names, visa programme names, and professional bodies — not generic topics.

**Source constraints:** Paste explicit domain URLs from the brief's "Key sources" section. Never use preset names (rule 9). Include 4–8 domains. Always include SA regulatory body official site.

**Iterations:** Use the table below by section complexity:
| Section | iter_cap |
|---|---|
| Destinations | 8 |
| Documents | 6 |
| Costs | 6 |
| Visa routes | 10 |
| Scams | 6 |
| Contacts | 6 |

**Note schemas:** Copy from the canonical template. Adapt entity types for the domain:
- Destinations section → add a DESTINATION entity type (destination country, demand signal, diaspora size, regulatory body, route status)
- Visa routes section → add a VISA_ROUTE entity type (route name, eligibility, processing time, PR pathway)
- Contacts section → add an ORGANISATION entity type (with `scope:` field clarifying what they do)
- All sections → keep PERSON, GOVERNMENT_BODY schemas; remove CONTRACT and EVENT schemas if not relevant

**Relationship_type enum:** Replace generic placeholders with domain-specific verbs:
- `regulates | recognises | requires | recommends | warns_against | sponsors | administers | partners_with`

**Tags:** Domain-specific per entity. Examples for engineering: `[destination, high-demand, engineers]`, `[visa-route, skilled-worker, australia]`, `[regulator, engineering, australia]`

**Runtime rules:** At minimum, include these in every prompt:
```
- Date-stamp all costs, thresholds, and occupation-list statuses (these change annually)
- Flag any closed or suspended routes explicitly as [CLOSED - do not recommend]
- Never present agent estimates as confirmed figures; source must be a government or regulator URL
- If a source is older than 12 months, flag evidence_strength as alleged unless confirmed by a recent primary source
```
Add section-specific rules from the brief's "Notes for prompt generation" section.

### Self-check before writing each file (rule 13)

Before writing the prompt file, verify:
- [ ] Every `[placeholder]` is filled (no brackets remain)
- [ ] Every folder in Folder structure has a corresponding schema
- [ ] No "begin research" instruction anywhere
- [ ] `evidence_strength` present on every schema including stubs
- [ ] `relationship_type` enum is domain-specific
- [ ] Tags are domain-specific on every schema
- [ ] Source constraints are explicit domain URLs, not preset names
- [ ] Canvas section is commented out

State confidence (1–10). If **≥ 8**: write the file. If **6–7**: identify the specific failing checks, fix them, re-check, then write. If still **< 8** after one retry: write anyway and add a note to `last_error` in state.

Write each prompt file immediately after its self-check — do not batch all 6 then write.

## 4. Determine shared_vaults_required

After all 6 prompts are written, scan their source-constraint lists for any references to shared vault data (documents, scams, migration companies, regulatory bodies, legal boundary, tax/exchange). Also consult `docs/pathway-intelligence-research.md` for shared-content node assignments.

Standard shared vaults to include for most categories:
- `wa-shared-documents` (SA document universals)
- `wa-shared-scams` (universal scam patterns)
- `wa-shared-regulatory-bodies` (SA professional body registry)

Include additionally if relevant to category:
- `wa-shared-migration-cos` (migration companies) — include if contacts section references them
- `wa-shared-legal-boundary` (legal boundary) — include if docs or contacts section references legal services
- `wa-shared-tax-exchange` (tax / forex) — include if costs section references forex or tax

Write the list to state under `shared_vaults_required`.

## 5. Update TRACKER.md

Open `docs/prompts/TRACKER.md`. Append one row per new prompt:

```markdown
| <category>/01-destination-options | wa-<category>-01-destinations | pending | — | — | — |
```

Column order (check existing headers): Category/File | Vault | Status | Iter count | Notes | FINAL_REPORT |

## 6. Update prompt_paths in state

```yaml
prompt_paths:
  - "docs/prompts/<category>/01-destination-options.md"
  - "docs/prompts/<category>/02-document-checklist.md"
  - "docs/prompts/<category>/03-realistic-costs.md"
  - "docs/prompts/<category>/04-visa-routes.md"
  - "docs/prompts/<category>/05-scam-red-flags.md"
  - "docs/prompts/<category>/06-legitimate-contacts.md"
```

## 7. Codex adversarial review of all 6 prompts

After all 6 prompts are written, send each to Codex CLI for adversarial review. Codex checks domain accuracy; you apply corrections inline before moving to stage 3.

### 7a. For each prompt file, run:

```bash
codex exec --model o4-mini --full-stdout -q "You are reviewing a vault-builder research prompt for factual accuracy before expensive research is run on it. The prompt is for South African professionals researching overseas work.

Review the following prompt file for:
1. FACTUAL ERRORS in runtime rules — are any domain-specific facts wrong or outdated? (e.g. wrong salary thresholds, closed routes described as open, wrong regulatory body names)
2. SEED ENTITY QUALITY — are the 5 seed entities specific named bodies/programmes, or are they too generic?
3. SOURCE CONSTRAINT GAPS — are any major authoritative sources missing for this domain?
4. SCHEMA GAPS — are there entity types common in this domain that are missing from the note schemas?

Respond ONLY in this format:
CORRECTIONS:
- [line or field]: [what is wrong] → [what it should be]

ADDITIONS:
- [what to add and where]

NO_CHANGES_NEEDED (if nothing to fix)

Be terse. Only flag genuine errors or significant gaps. Do not suggest style changes.

--- PROMPT FILE CONTENT ---
$(cat docs/prompts/<category>/<prompt-file>)" 2>&1
```

Run this for each of the 6 prompt files. Capture the output.

### 7b. Apply corrections

For each prompt where Codex returns `CORRECTIONS:` or `ADDITIONS:` (not `NO_CHANGES_NEEDED`):
- Read the specific line/field cited
- Apply the correction directly to the prompt file
- Log what was changed

If Codex's correction contradicts a fact from the `_BRIEF.md` or a nursing runtime rule, prefer the brief — Codex may hallucinate; the brief was researched.

### 7c. Log review results

Append to run log:
```
- <datetime> — Codex review: <N>/6 prompts corrected (<list of slugs that had changes>)
```

## 8. Mark completed and hard-exit

Update state:
```yaml
current_stage: 2
stage_status: completed
last_error: null   # or the confidence note if any prompt scored < 8
```
Append to run log: `- <datetime> — Stage 2 complete: 6 prompts written and Codex-reviewed`

Print:
```
✓ Stage 2 complete for <category>.
6 prompts written and Codex-reviewed.
Corrections applied: <N> prompts updated

Run /build-pathway <category> to continue to stage 3 (vault building).
```
