# Stage 4 — Synthesis (Team)

**Entry condition:** `current_stage: 4, stage_status: pending` (after manifest hash verified in SKILL.md Step 2).
**Purpose:** Six sonnet teammates each write one guide section to separate files. No file-conflict risk since each teammate owns exactly one output file.

## 1. Mark in-progress

Record stage start time for RUN_REPORT.

Update state:
```yaml
current_stage: 4
stage_status: in_progress
last_run_at: <now>
```
Append to run log: `- <datetime> — Stage 4 started`

## 2. Idempotency — file-truth reconciliation

Scan all 6 section files in `state.section_files`. For each:

**A section is `completed` if and only if ALL of these hold:**
1. Output file exists on disk at the expected path
2. File is > 1000 bytes
3. File contains exactly one `## ` H2 heading
4. File contains at least one `<!-- src:` claim marker

Reconcile state against this truth:
- Any `in_progress` or `failed` section whose file passes all 4 checks → mark `completed` (already done)
- Any `pending` section whose file passes all 4 checks → mark `completed` (from a prior partial run)
- Any `in_progress` section whose file is absent or fails checks → mark `pending` (orphaned — respawn)
- Any `completed` section whose file fails checks → mark `pending` + set `last_error_class: output_invalid`

**Do NOT use TaskList liveness as the source of truth.** Tasks may be stale from prior sessions.

## 3. Nursing reference preflight

Before spawning any teammates, verify the tone reference exists and is intact:
1. Check that `docs/guides/healthcare-nurses.md` exists on disk.
2. Grep for the 6 canonical H2 headings (from `docs/guide-template.md`):
   - `## 1. Destination Options`
   - `## 2. Document Checklist`
   - `## 3. Realistic Costs`
   - `## 4. Visa Route Overview`
   - `## 5. Scam Red Flags`
   - `## 6. Legitimate Contacts`
3. If the file is missing or any heading is absent → write `stage_status: failed`, `last_error: "healthcare-nurses.md missing or incomplete — required as tone reference"`, append to RUN_REPORT, hard-exit.

## 4. Resolve source paths (path-passing — do NOT read file content)

**The parent session must NOT load FINAL_REPORT content, wiki notes, or shared vault reports inline.** This is the single change that prevents context exhaustion. Resolve paths only — teammates read the files themselves.

For each section `i` (01 through 06):

### 4a. Resolve FINAL_REPORT path

Already stored in `state.vaults[i].final_report_path`. Verify it exists. If not, fail precondition (should have been caught by SKILL.md precondition check).

### 4b. Resolve top wiki note paths (max 5)

Read `<vault_path>/wiki/index.md`. Count `[[wikilink]]` occurrences per note title. Take the top 5 by link count. Map each title to its file path: `<vault_path>/wiki/<Title>.md`. Verify each file exists; skip any that don't (log warning).

### 4c. Resolve shared vault FINAL_REPORT paths

Use the routing table:

| Section | Always include | Also include if shared vault status is completed/reused |
|---|---|---|
| 01-destinations | wa-shared-documents | wa-shared-regulatory-bodies |
| 02-documents | wa-shared-documents | — |
| 03-costs | — | wa-shared-migration-cos, wa-shared-tax-exchange |
| 04-visa-routes | wa-shared-regulatory-bodies | wa-shared-legal-boundary |
| 05-scams | wa-shared-scams | wa-shared-migration-cos |
| 06-contacts | wa-shared-regulatory-bodies | wa-shared-migration-cos, wa-shared-scams |

For each applicable shared vault, get its `final_report_path` from `state.shared_vaults_status`. Max 2 paths per section.

### 4d. Resolve nursing section reference path

The nursing guide section files are extracted once and stored at:
`docs/guides/healthcare-nurses.section-<N>-<slug>.md`

If these per-section extracts do not exist, extract them now: read `docs/guides/healthcare-nurses.md`, split on `## ` headings, write each section to its own file. This is a cheap one-time operation.

Resolved path: `docs/guides/healthcare-nurses.section-<NN>-<matching-slug>.md`

### 4e. Write source_paths to state

```yaml
section_files[i].source_paths:
  brief: "docs/prompts/<category>/_BRIEF.md"
  final_report: "<vault_path>/FINAL_REPORT.md"
  wiki_notes:
    - "<vault_path>/wiki/<Title1>.md"
    - "<vault_path>/wiki/<Title2>.md"
    ... (up to 5)
  shared_vault_reports:
    - "<shared_vault_path>/FINAL_REPORT.md"
    ... (up to 2)
  nursing_section: "docs/guides/healthcare-nurses.section-<NN>-<slug>.md"
```

Write state now (snapshot to .bak first per SKILL.md rule).

## 5. Scaffold output directory

Ensure `docs/guides/` exists. Do NOT pre-create section files — teammates create their own.

Create TaskCreate for each section that is not already `completed`. Subject: `Write section <N>: <heading>`.

## 6. Create team and spawn teammates

**Wrap this entire block in error handling. If TeamCreate or any Agent spawn throws, immediately:**
1. Reset all sections just marked `in_progress` back to `pending`
2. Write `stage_status: failed`, `last_error: "TeamCreate failed: <error>"`, `last_error_class: task_died`
3. Append to RUN_REPORT
4. Hard-exit

Use `TeamCreate` to create a team named `synth-<category>`.

For each section where `section_files[i].status != completed`:

Mark `section_files[i].status: in_progress` in state **before** spawning (so a session kill during spawn is recoverable).

Read the spawn prompt template from `.claude/skills/build-pathway/references/teammate-prompts.md`.

Fill in all `{{PLACEHOLDER}}` fields for each section. The new template uses **file paths**, not inline content — see teammate-prompts.md for the updated field list.

Spawn a teammate using the `Agent` tool with `team_name: synth-<category>`, `model: sonnet`.

## 7. Wait for all teammates

Poll `TaskList` every 60 seconds. Wait until all spawned section tasks are `completed` or `failed`.

Do not close the team while any task is still `in_progress`.

## 8. Collect results, postcheck, TeamDelete

After all tasks resolve:

### 8a. Verify output files (file-truth check)

For each task that returned `completed`:
- Verify the section file passes the 4-part file-truth check from Step 2.
- If it fails any check: mark `section_files[i].status: failed`, `last_error_class: output_invalid`.

### 8b. Claim marker postcheck

For each section file that passes Step 8a:
- Grep for paragraphs containing a numeric or policy claim (lines with digits followed by units, or policy keywords: "visa", "permit", "salary", "fee", "threshold", "requirement", "eligible").
- For each such paragraph, verify it ends with or contains a `<!-- src:` marker.
- If any paragraph with a qualifying claim lacks a marker: mark `section_files[i].status: failed`, `last_error_class: provenance_missing`, `last_error: "N paragraphs with numeric/policy claims lack <!-- src: --> markers"`.
- Increment `attempts` only on new failures (not on sections already failed before this run).

### 8c. Section attempt cap

After incrementing attempts: if any section has `attempts >= 2`:
- If `last_error_class == agent_refused`: hard-stop immediately, do not offer retry.
- Otherwise: hard-stop with manual inspection prompt (see error-policy.md).

### 8d. TeamDelete

Run `TeamDelete` on `synth-<category>`.

## 9. Evaluate overall result

**All 6 sections completed (pass 8a + 8b):**
```yaml
stage_status: completed
```
Append to run log: `- <datetime> — Stage 4 complete: all 6 sections written and validated`
Auto-advance to Stage 4.5 (do NOT hard-exit).

**Any sections failed:**
```yaml
stage_status: failed
last_error: "Sections failed: <list section slugs> (classes: <list>)"
```
Append to RUN_REPORT: stage 4 failure block with slug, class, attempt count per failed section.
Append to run log: `- <datetime> — Stage 4 partial failure: sections <slugs> failed`
Print:
```
✗ Stage 4 partial for <category>. Failed sections: <slugs> (classes: <classes>)
RUN_REPORT: docs/prompts/<category>/RUN_REPORT.md
Run /build-pathway <category> to re-spawn the failed sections only.
```
Hard-exit. On next invocation, Step 2 file-truth reconciliation determines which sections to re-spawn.
