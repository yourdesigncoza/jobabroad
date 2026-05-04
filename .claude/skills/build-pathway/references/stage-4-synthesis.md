# Stage 4 — Synthesis (Team)

**Entry condition:** `current_stage: 4`.
**Purpose:** Six sonnet teammates each write one guide section to separate files. No file-conflict risk since each teammate owns exactly one output file.

## 1. Mark in-progress

Update state:
```yaml
current_stage: 4
stage_status: in_progress
last_run_at: <now>
```
Append to run log: `- <datetime> — Stage 4 started`

## 2. Idempotency: clean up stale section files

Check for any pre-existing `docs/guides/<category>.section-*.md` files from a prior failed run.
For each file found:
- If its matching `section_files[i].status == completed`: **keep it** — do not delete.
- If `status != completed` (failed or partial): **delete the file** — it may be corrupt or incomplete.

Reset non-completed section_file statuses to `pending`.

## 3. Scaffold the output directory

Ensure `docs/guides/` directory exists. Do NOT pre-create the section files — teammates create their own.

## 4. Prepare teammate context (once, before spawning)

Read and cache these files (they are passed to every teammate):
- `.claude/skills/build-pathway/references/buyer-north-star.md` — **include for every teammate**; the teammate's section must answer the buyer's question for that section
- `docs/prompts/<category>/_BRIEF.md`
- `docs/guide-template.md`

For each section, also prepare:
- Section's `FINAL_REPORT.md` full text
- The 3–5 most-linked wiki notes from that vault (read vault's `wiki/index.md` to identify the top-linked notes by counting `[[wikilink]]` references, then read those `.md` files)
- Relevant shared-vault `FINAL_REPORT.md`s (see routing table below)
- The matching section from `docs/guides/healthcare-nurses.md` as a tone reference

**Shared-vault routing table:**

| Section | Always include | Also include if present |
|---|---|---|
| 01-destinations | wa-shared-documents | wa-shared-regulatory-bodies |
| 02-documents | wa-shared-documents | — |
| 03-costs | — | wa-shared-migration-cos, wa-shared-tax-exchange |
| 04-visa-routes | wa-shared-regulatory-bodies | wa-shared-legal-boundary |
| 05-scams | wa-shared-scams | wa-shared-migration-cos |
| 06-contacts | wa-shared-regulatory-bodies | wa-shared-migration-cos, wa-shared-scams |

"Present" means `shared_vaults_status[i].status ∈ {reused, completed}`.

## 5. Create TaskCreate for each section

Use `TaskCreate` for each of the 6 sections. Subject: `Write section <N>: <heading>`.

## 6. Create team and spawn teammates

Use `TeamCreate` to create a team named `synth-<category>`.

For each section where `section_files[i].status != completed`, spawn a teammate using the `Agent` tool with `team_name: synth-<category>`, `model: sonnet`.

Read the spawn prompt template from `.claude/skills/build-pathway/references/teammate-prompts.md`.
Fill in all `{{PLACEHOLDER}}` fields for each section before spawning.

Mark each section's `section_file.status: in_progress` in state before spawning its teammate.

## 7. Wait for all teammates

Poll `TaskList` every 60 seconds. Wait until all 6 section tasks are `completed` or `failed`.

Do not close the team while any task is still `in_progress`.

## 8. Collect results and TeamDelete

After all tasks resolve:
1. For each `completed` task: verify the teammate's output file exists and is > 1000 bytes. If the file is missing or too small, mark that section as `failed`.
2. For each `failed` task: mark `section_files[i].status: failed`, increment attempts.
3. Run `TeamDelete` on `synth-<category>`.

## 9. Evaluate overall result

**All 6 sections completed:** Update state:
```yaml
stage_status: completed
```
Append to run log: `- <datetime> — Stage 4 complete: all 6 sections written`
Auto-advance to Stage 4.5 (do NOT hard-exit).

**Any sections failed:** Update state:
```yaml
stage_status: failed
last_error: "Sections failed: <list section slugs>"
```
Append to run log: `- <datetime> — Stage 4 partial failure: sections <slugs> failed`
Print:
```
✗ Stage 4 partial for <category>. Failed sections: <slugs>
Run /build-pathway <category> to re-spawn the failed sections only.
```
Hard-exit. On next invocation, only spawn teammates for the failed sections.
