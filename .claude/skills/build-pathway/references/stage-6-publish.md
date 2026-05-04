# Stage 6 — Publish

**Entry condition:** `current_stage: 6`.
**Purpose:** Run publish_gate checks, copy the reviewed guide to `content/pathways/<category>.md`, and update CLAUDE.md.

Record stage start time for RUN_REPORT.

## 1. Mark in-progress

Update state:
```yaml
current_stage: 6
stage_status: in_progress
last_run_at: <now>
```
Append to run log: `- <datetime> — Stage 6 started`

## 2. Publish gate — hard check (must pass before any publish action)

Compute the following and write to `state.publish_gate`:

### Check 1: unresolved_blocking_todos
```bash
grep -c "TODO: human-review:" docs/guides/<category>.md
```
Value must be `0`. Any `<!-- TODO: human-review: -->` marker is a blocking claim that was not verified.

### Check 2: non_primary_corrections_applied
Read `state.publish_gate.non_primary_corrections_applied` (incremented by stage 5 when a correction was applied despite failing the primary-source check — this should always be 0 since stage 5 blocks non-primary corrections). If > 0, this indicates a logic error in stage 5.

### Check 3: unverified_high_risk_claims
Count claim markers in the HIGH-RISK sections (03-costs, 04-visa-routes, 06-contacts) with `tier=unverified`:
```bash
grep -c "tier=unverified" docs/guides/<category>.section-03-costs.md
grep -c "tier=unverified" docs/guides/<category>.section-04-visa-routes.md
grep -c "tier=unverified" docs/guides/<category>.section-06-contacts.md
```
Sum must be `0`. Unverified claims in cost/visa/contact sections can cause real financial or legal harm to readers.

### Check 4: all_sections_reviewed_at_current_hash
For each of the 6 sections in `state.gemini_review_status`:
- Verify `reviewed_against_guide_hash == state.guide_hash`

All 6 must match. If the guide was modified after any section was reviewed (e.g. corrections in one section changed the file hash before later sections were reviewed), this check catches the drift.

### Gate decision

Write to state:
```yaml
publish_gate:
  unresolved_blocking_todos: <n>
  non_primary_corrections_applied: <n>
  unverified_high_risk_claims: <n>
  all_sections_reviewed_at_current_hash: <true|false>
  passed: <true only if all 4 checks pass>
```

**If any check fails:**
```yaml
stage_status: failed
last_error: "publish_gate failed: <list failing checks>"
```
Append to RUN_REPORT: stage 6 failure block with the full publish_gate object and per-section hash comparison (see run-report.md format). Hard-exit:
```
✗ Stage 6 blocked by publish_gate for <category>.
Failing checks: <list>
RUN_REPORT: docs/prompts/<category>/RUN_REPORT.md

To resolve:
  - unresolved_blocking_todos > 0: search for "TODO: human-review" and resolve manually, then re-run stage 5
  - unverified_high_risk_claims > 0: inspect tier=unverified markers in costs/visa/contacts sections
  - all_sections_reviewed_at_current_hash false: re-run stage 5 to refresh section review hashes
```

## 3. Pre-publish check

Read `docs/guides/<category>.md`. Verify:
- File exists and is > 8000 bytes
- 6 H2 sections present
- No `{{PLACEHOLDER}}` text remains

If checks fail: write `stage_status: failed`, append to RUN_REPORT, hard-exit with specific error.

## 4. Copy to content/pathways/

Copy `docs/guides/<category>.md` to `content/pathways/<category>.md`.

**Important:** This is a copy, not a move. Keep `docs/guides/<category>.md` as the working draft.

Verify the copy succeeded: file exists at `content/pathways/<category>.md` and size matches.

If copy fails: write `stage_status: failed`, `last_error: "copy to content/pathways/ failed"`, append to RUN_REPORT, hard-exit.

## 5. Update CLAUDE.md

Read `CLAUDE.md`. Find the "What's done" section. Add a line for this category:
```markdown
- `content/pathways/<category>.md` — full <category-label> guide (6 sections, Gemini-reviewed)
```

Find the "What to do next" section. Remove any existing line about building the `<category>` guide if present.

Write the updated CLAUDE.md.

## 6. Update state file

```yaml
current_stage: 6
stage_status: completed
published_path: "content/pathways/<category>.md"
last_error: null
```

Append to run log:
```
- <datetime> — Stage 6 complete: published to content/pathways/<category>.md
```

Append to RUN_REPORT: stage 6 success block with published path, size, and publish_gate summary.

## 7. Print final summary

```
✓ Pipeline complete for <category>.

Published: content/pathways/<category>.md
Guide stats:
  - 6 sections (Destination Options / Documents / Costs / Visa Routes / Scams / Contacts)
  - Vaults built: <count> (iter total: <sum of iter_counts>)
  - Gemini review: 6 sections reviewed
  - TODO flags for human review: 0 (publish gate required clean pass)

The guide is now available at:
  /members/[token] — for any lead with interest_category = <category>

RUN_REPORT: docs/prompts/<category>/RUN_REPORT.md
```

Hard-exit.
