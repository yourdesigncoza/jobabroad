# Stage 0 — Pre-flight + Scaffold

**Entry condition:** `_PIPELINE_STATE.md` does not exist for this category.

## 1. Pre-flight checks

Run each check. If any fails, stop immediately with a descriptive error — do NOT proceed.

### 1a. Category validation
Confirm `<category>` ∈ {engineering, it-tech, teaching, accounting, farming, healthcare, seasonal, hospitality, trades}.

### 1b. Required files readable
Check that each of these files exists and can be read:

```
docs/prompts/research-prompt.md
docs/guide-template.md
docs/pathway-intelligence-research.md
docs/prompts/TRACKER.md
docs/prompts/nursing/01-destination-options.md
docs/prompts/nursing/02-document-checklist.md
docs/prompts/nursing/03-realistic-costs.md
docs/prompts/nursing/04-visa-routes.md
docs/prompts/nursing/05-scam-red-flags.md
docs/prompts/nursing/06-legitimate-contacts.md
```

### 1c. Research wiki readable
```
/home/laudes/zoot/projects/wiki-builds/work-abroad-pathway-intelligence/wiki/index.md
```

### 1d. Vault root writable
Confirm the vault root directory exists and is writable:
```
/home/laudes/zoot/projects/wiki-builds/work-abroad-web/
```

Use `ls -la /home/laudes/zoot/projects/wiki-builds/work-abroad-web/` to verify.

### 1e. Category in research doc
Read the first 100 lines of `docs/pathway-intelligence-research.md`. Confirm the category is mentioned. If not, stop with:
```
Error: Category "<category>" not found in docs/pathway-intelligence-research.md.
Add it to the research document before running this pipeline.
```

### 1f. Output directory writable
Confirm `docs/prompts/` is writable. Create `docs/prompts/<category>/` directory if it does not exist.

## 2. Scaffold state file

Read the template at `.claude/skills/build-pathway/templates/PIPELINE_STATE.md.tpl`.

Replace all occurrences of:
- `{{CATEGORY}}` → the category name (e.g. `engineering`)
- `{{DATETIME}}` → current datetime in ISO8601 format (run `date -Iseconds` via Bash)

Write the result to `docs/prompts/<category>/_PIPELINE_STATE.md`.

## 3. Transition to Stage 1

Update state:
```yaml
current_stage: 0
stage_status: completed
```

Append to run log:
```
- <datetime> — Stage 0 complete: pre-flight passed, state file scaffolded
```

**Auto-advance:** Do NOT hard-exit. Immediately proceed to Stage 1 handler (`stage-1-brief.md`).
