# Stage 3 — Vault Building

**Entry condition:** `current_stage: 3`.
**Purpose:** Build category vaults via vault-builder, 3 per invocation (serial). Two invocations clear stage 3.

## 1. Mark in-progress

Update state:
```yaml
current_stage: 3
stage_status: in_progress
last_run_at: <now>
```
Append to run log: `- <datetime> — Stage 3 started (or resumed)`

## 2. Resolve shared vaults

For each vault slug in `state.shared_vaults_required`:
1. Check if the vault directory exists on disk:
   ```
   /home/laudes/zoot/projects/wiki-builds/work-abroad-web/<vault-slug>/
   ```
   Example: `/home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-shared-documents/`
2. If exists: update `shared_vaults_status` entry to `status: reused`. These are from the nursing run — do not rebuild them.
3. If missing: add to the current batch as a new vault to build. Use the shared vault's existing prompt file at:
   ```
   docs/prompts/shared/<slug-without-wa-shared-prefix>.md
   ```
   e.g. `docs/prompts/shared/sa-documents-universal.md`

## 3. Select the current batch

Pick up to 3 vaults from `state.vaults` where:
- `status ∈ {pending, failed}` AND
- `attempts < 2`

Take them in section order (01 first, 06 last). If fewer than 3 qualify, build only those that qualify.

If 0 vaults qualify, check if all 6 are `status ∈ {completed, reused}`. If yes, advance to stage 4 (see step 7). If any are `status: failed` with `attempts >= 2`, stop with an error (manual intervention needed).

## 4. Build each vault in the batch (serial)

For each vault in the batch, run steps 4a–4e before moving to the next vault.

### 4a. Set vault paths

The vault directory path is:
```
/home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-<category>-<section>/
```

Examples:
- `wa-engineering-01-destinations`
- `wa-it-tech-03-costs`

Update the vault entry in state:
```yaml
vault_path: "/home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-<category>-<section>"
final_report_path: "<vault_path>/FINAL_REPORT.md"
iter_log_path: "<vault_path>/.vault-builder/iter_log.jsonl"
status: in_progress
attempts: <current attempts + 1>
```

### 4b. Spawn the vault-builder Agent

Read the spawn prompt template from `.claude/skills/build-pathway/references/vault-spawn-prompt.md`.

Fill in the template variables:
- `{{VAULT_PATH}}` → absolute vault directory path
- `{{PROMPT_PATH}}` → absolute path to the section prompt file (e.g. `docs/prompts/engineering/01-destination-options.md`)
- `{{ITER_CAP}}` → iteration cap from the prompt file (read the `**Iterations:**` line), or 8 if not specified

Spawn an Agent (Sonnet) with this prompt. Wait for it to complete and return a result.

### 4c. Evaluate Agent result

The Agent must report back:
- `iter_count` — number of iterations run
- `note_count` — number of wiki notes created
- `final_report_path` — path to FINAL_REPORT.md (for verification)
- `error` — null or error description

**Verify success criteria (permanent failure if any fail after 3 transient retries):**
- `FINAL_REPORT.md` exists and is non-empty (> 500 bytes)
- `iter_log.jsonl` exists and has ≥ 1 line
- `wiki/Conclusion.md` exists
- `note_count >= 5`

### 4d. Update vault status in state

**On success:**
```yaml
status: completed
iter_count: <from agent report>
note_count: <from agent report>
last_error: null
```

**On failure:** follow `error-policy.md` permanent-failure handling. Update:
```yaml
status: failed
last_error: "<error description>"
```

If `attempts >= 2` after this failure, stop the entire batch immediately with:
```
✗ Vault <vault_path> has failed 2 times. Manual intervention required.
Check the prompt at: <prompt_path>
Inspect the vault dir at: <vault_path>
```

### 4e. Update TRACKER.md

Find the row for this prompt/vault in `docs/prompts/TRACKER.md`. Update status, iter count, and note count columns.

## 5. Mark batch complete

After all 3 vaults in the batch are processed (completed or failed):

Update state:
```yaml
stage_status: completed
```

Append to run log:
```
- <datetime> — Stage 3 batch complete: vaults <01-N> processed (<X> completed, <Y> failed)
```

## 6. Hard-exit

Append to `docs/prompts/<category>/RUN_REPORT.md` (create if absent — see `references/run-report.md` schema):
- Stage 3 block with completed/failed vault slugs, SHA256s of FINAL_REPORTs produced, and next_action.

Print:
```
✓ Stage 3 batch complete for <category>.
Vaults built this batch: <list completed vault names>
<If any failed> Failed vaults: <list> (will retry on next invocation)

Vaults remaining: <count of pending+failed-with-attempts<2>
Run /build-pathway <category> to continue.
```

Hard-exit.

## 7. Advance to Stage 4 — REVIEW GATE (all vaults done)

If this invocation finds 0 vaults qualify for the batch (all 6 are completed/reused):

### 7a. Build manifest.json

For each of the 6 FINAL_REPORT files:
```bash
shasum -a 256 <final_report_path>  # or sha256sum on Linux
```

Write `docs/prompts/<category>/manifest.json`:
```json
{
  "category": "<category>",
  "created_at": "<ISO8601 datetime>",
  "vaults": [
    { "section": "01-destinations", "final_report_path": "<abs path>", "sha256": "<hex>", "size_bytes": <n> },
    ... (6 entries)
  ]
}
```

Compute `manifest_hash`: SHA256 of the sorted concatenation of `"<final_report_path>:<sha256>"` strings (one per line, sorted lexicographically, no trailing newline).
```bash
echo -n "<line1>\n<line2>..." | shasum -a 256
```

### 7b. Update state

```yaml
current_stage: 4
stage_status: pending
manifest_hash: "<64-char hex>"
```

Append to run log: `- <datetime> — Stage 3 complete: all 6 vaults done. Manifest hash: <first 12 chars of hash>...`

### 7c. Append to RUN_REPORT

Append a stage 3 success block to `docs/prompts/<category>/RUN_REPORT.md` (create if absent):
- List all 6 FINAL_REPORT paths with SHA256 + size
- Include manifest_hash
- next_action: `/build-pathway <category> proceed <manifest_hash>`

### 7d. Automated vault quality assessment

Do NOT ask the human to read FINAL_REPORTs. Run quality checks automatically.

For each of the 6 FINAL_REPORTs:

**Structural checks (Claude, no external call needed):**
- File size > 5000 bytes → pass
- Contains a `## Conclusion` or `## Summary` heading → pass
- Contains at least 10 `[[wikilink]]` references → pass (indicates the vault built a real graph, not a stub)
- No `{{PLACEHOLDER}}` text → pass

**Gemini quality pass (one call per vault, sequential):**

Send each FINAL_REPORT to Gemini with this prompt:
```
You are reviewing a research vault FINAL_REPORT built for a South African work-abroad guide.
The vault covers: {{SECTION_TOPIC}} for the category: {{CATEGORY}}

Read the report below and answer these questions with YES/NO + one line reasoning:
1. Does the report contain specific, named destinations with concrete evidence of demand?
2. Does it contain at least one official government or regulatory source URL?
3. Are the key facts (fees, thresholds, requirements) specific enough to write a guide from?
4. Is there any section that is dangerously thin (fewer than 3 paragraphs of substance)?

Report:
{{FINAL_REPORT_CONTENT}}

Respond in this exact format:
Q1: YES/NO — <reason>
Q2: YES/NO — <reason>
Q3: YES/NO — <reason>
Q4: YES/NO (thin sections: <list or "none">) — <reason>
VERDICT: PASS / BORDERLINE / FAIL
VERDICT_REASON: <one sentence>
```

Use `mcp__gemini-cli__ask-gemini` with `model: "gemini-2.5-pro"`.

**Classify each vault:**
- `PASS`: all 4 structural checks pass + Gemini VERDICT = PASS
- `BORDERLINE`: structural pass + Gemini VERDICT = BORDERLINE
- `FAIL`: any structural check fails OR Gemini VERDICT = FAIL

If any vault is `FAIL`: write a warning into the RUN_REPORT and gate printout. The gate still opens (the human decides whether to rebuild or proceed), but the failure is explicit.

### 7e. Print REVIEW GATE and hard-exit

```
─────────────────────────────────────────────────────
STAGE 3 COMPLETE — REVIEW GATE
Category: <category>

Vault quality assessment:
  01-destinations:  PASS/BORDERLINE/FAIL — <Gemini verdict reason>
  02-documents:     PASS/BORDERLINE/FAIL — <Gemini verdict reason>
  03-costs:         PASS/BORDERLINE/FAIL — <Gemini verdict reason>
  04-visa-routes:   PASS/BORDERLINE/FAIL — <Gemini verdict reason>
  05-scams:         PASS/BORDERLINE/FAIL — <Gemini verdict reason>
  06-contacts:      PASS/BORDERLINE/FAIL — <Gemini verdict reason>

<If any FAIL>
⚠ FAIL vaults detected. To rebuild:
  delete <vault_path> and run /build-pathway <category>

Run report: docs/prompts/<category>/RUN_REPORT.md
Manifest hash: <full 64-char hex>

When ready: /build-pathway <category> proceed <manifest_hash>
─────────────────────────────────────────────────────
```

Hard-exit.
