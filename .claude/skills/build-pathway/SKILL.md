---
name: build-pathway
description: Automates the jobabroad.co.za pathway guide pipeline. Trigger with /build-pathway <category>. Valid categories: engineering | it-tech | teaching | accounting. Reads docs/prompts/<category>/_PIPELINE_STATE.md on each invocation and resumes from the current stage. One invocation = one stage (or one batch of 3 vaults). Re-invoke to continue.
---

# build-pathway

Automated 7-stage pathway-content pipeline for jobabroad.co.za. Each invocation reads state and runs the next stage, then hard-exits with a resume hint.

## Step 1 — Parse and validate

Read the category argument from the user's invocation: `/build-pathway <category>`.

Valid categories: `engineering` | `it-tech` | `teaching` | `accounting`

If the argument is missing or invalid, stop with:
```
Error: Unknown category "<input>". Valid categories: engineering | it-tech | teaching | accounting
```

## Step 2 — Locate and read state file

State file path (project-relative): `docs/prompts/<category>/_PIPELINE_STATE.md`

| State file condition | Action |
|---|---|
| Does not exist | Run Stage 0 immediately |
| Exists, YAML parse fails | Restore from `_PIPELINE_STATE.md.bak`; if bak also fails, stop with error message |
| `current_stage: 6, stage_status: completed` | Print "Pipeline complete for <category>." and stop. |
| `stage_status: failed` | Print `last_error`, then re-attempt the failed stage |
| `stage_status: in_progress` | Resume current stage (skip steps already done, do remaining) |
| `stage_status: completed` | Advance to next stage and run it |

**Stage 3 special case:** `stage_status: completed` in stage 3 means one batch of 3 vaults finished. Check whether all 6 category vaults have `status: completed`. If yes, advance to stage 4. If no, re-run stage 3 for the next batch.

## Step 3 — Dispatch to stage handler

Read the appropriate reference file and follow its instructions exactly:

| Stage | Handler |
|---|---|
| 0 | `.claude/skills/build-pathway/references/stage-0-scaffold.md` |
| 1 | `.claude/skills/build-pathway/references/stage-1-brief.md` |
| 2 | `.claude/skills/build-pathway/references/stage-2-prompts.md` |
| 3 | `.claude/skills/build-pathway/references/stage-3-vaults.md` |
| 4 | `.claude/skills/build-pathway/references/stage-4-synthesis.md` |
| 4.5 | `.claude/skills/build-pathway/references/stage-4_5-concatenate.md` |
| 5 | `.claude/skills/build-pathway/references/stage-5-review.md` |
| 6 | `.claude/skills/build-pathway/references/stage-6-publish.md` |

## State file snapshot rule (mandatory before every write)

Before EVERY state file write:
1. Copy current state file to `_PIPELINE_STATE.md.bak` (overwrite the bak)
2. Write the new state
3. Verify the new file parses as valid YAML — read it back and confirm `current_stage` is a number
4. If verification fails: restore from `.bak`, stop with an error

## Auto-progress and hard-exit rules

| Stage | Exit behaviour |
|---|---|
| 0 → 1 | Auto-progress (cheap; always run together) |
| 1 → 2 | Auto-progress (cheap; always run together) |
| 2 | Hard-exit after prompts written |
| 3 | Hard-exit after each batch of 3 vaults |
| 4 | Hard-exit after synthesis team completes |
| 4.5 → 5 | Auto-progress (cheap deterministic step) |
| 5 | Hard-exit after all sections reviewed |
| 6 | Hard-exit with "Pipeline complete." |

Hard-exit message format:
```
✓ Stage <N> complete for <category>.
Run /build-pathway <category> to continue.
```

## Error policy

Read `.claude/skills/build-pathway/references/error-policy.md` for transient/permanent error classification and retry budgets. All stage handlers must follow it.

## State schema

Read `.claude/skills/build-pathway/references/state-schema.md` for the full YAML field specification and idempotency rules before writing any state.
