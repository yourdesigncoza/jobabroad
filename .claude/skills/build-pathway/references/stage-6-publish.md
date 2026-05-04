# Stage 6 — Publish

**Entry condition:** `current_stage: 6`.
**Purpose:** Copy the reviewed guide to `content/pathways/<category>.md` and update CLAUDE.md.

## 1. Mark in-progress

Update state:
```yaml
current_stage: 6
stage_status: in_progress
last_run_at: <now>
```
Append to run log: `- <datetime> — Stage 6 started`

## 2. Pre-publish check

Read `docs/guides/<category>.md`. Verify:
- File exists and is > 8000 bytes
- 6 H2 sections present
- No `{{PLACEHOLDER}}` text remains

Count `<!-- TODO: human-review -->` markers. If count > 0, print a warning but do NOT block:
```
⚠ Warning: <N> sections have TODO flags for human review.
These are disputed claims that Gemini flagged. The guide will publish with these markers.
Review them after publishing by searching for "TODO: human-review" in content/pathways/<category>.md.
```

## 3. Copy to content/pathways/

Copy `docs/guides/<category>.md` to `content/pathways/<category>.md`.

**Important:** This is a copy, not a move. Keep `docs/guides/<category>.md` as the working draft.

Verify the copy succeeded: file exists at `content/pathways/<category>.md` and size matches.

## 4. Update CLAUDE.md

Read `CLAUDE.md`. Find the "What's done" section. Add a line for this category:
```markdown
- `content/pathways/<category>.md` — full <category-label> guide (6 sections, Gemini-reviewed)
```

Find the "What to do next" section. Remove any existing line about building the `<category>` guide if present.

Write the updated CLAUDE.md.

## 5. Update state file

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

## 6. Print final summary

```
✓ Pipeline complete for <category>.

Published: content/pathways/<category>.md
Guide stats:
  - 6 sections (Destination Options / Documents / Costs / Visa Routes / Scams / Contacts)
  - Vaults built: <count> (iter total: <sum of iter_counts>)
  - Gemini review: 6 sections reviewed
  - TODO flags for human review: <total count>

<If todo_flags > 0>
Open content/pathways/<category>.md and search for "TODO: human-review" to see disputed claims.

The guide is now available at:
  /members/[token] — for any lead with interest_category = <category>
```

Hard-exit.
