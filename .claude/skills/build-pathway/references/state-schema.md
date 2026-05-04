# State Schema — _PIPELINE_STATE.md

State files live at `docs/prompts/<category>/_PIPELINE_STATE.md`.
Always snapshot to `.bak` before writing (see SKILL.md).

## YAML frontmatter fields

| Field | Type | Valid values | Set by stage |
|---|---|---|---|
| `category` | string | engineering, it-tech, teaching, accounting | 0 (never changed) |
| `current_stage` | number | 0, 1, 2, 3, 4, 4.5, 5, 6 | each stage on entry |
| `stage_status` | string | pending, in_progress, completed, failed | each stage |
| `started_at` | ISO8601 | datetime | 0 (never changed) |
| `last_run_at` | ISO8601 | datetime | each invocation start |
| `last_error` | string or null | null or description | set on failure; clear to null on success |
| `brief_path` | string or null | relative path | 1 on completion |
| `prompt_paths` | list[string] | 6 relative paths | 2 on completion |
| `shared_vaults_required` | list[string] | vault slugs | 2 on completion |
| `shared_vaults_status` | list[object] | see below | 3 |
| `vaults` | list[object] | see below | 0 (scaffolded), 3 (updated) |
| `section_files` | list[object] | see below | 4 |
| `synthesis_doc` | string or null | relative path | 4.5 |
| `guide_hash` | string or null | SHA256 hex of assembled guide | 4.5 |
| `manifest_hash` | string or null | SHA256 of sorted (path, sha256) pairs from manifest.json | 3 |
| `gemini_review_status` | list[object] | see below | 5 |
| `publish_gate` | object or null | see below | 6 |
| `published_path` | string or null | relative path | 6 |

## vault object schema

```yaml
- section: "01-destinations"        # short slug — never changes
  vault_path: "/abs/path/to/vault"   # absolute path; null until stage 3 begins
  final_report_path: "/abs/path/to/FINAL_REPORT.md"
  iter_log_path: "/abs/path/to/.vault-builder/iter_log.jsonl"
  status: pending                    # pending | in_progress | completed | failed | reused
  iter_count: null                   # integer; set on completion
  note_count: null                   # integer; set on completion
  last_error: null
  attempts: 0                        # increments on each failure; stop at 2
```

The 6 fixed sections and vault slugs:

| section | slug | vault name pattern |
|---|---|---|
| 01-destinations | destinations | wa-<category>-01-destinations |
| 02-documents | documents | wa-<category>-02-documents |
| 03-costs | costs | wa-<category>-03-costs |
| 04-visa-routes | visa-routes | wa-<category>-04-visa-routes |
| 05-scams | scams | wa-<category>-05-scams |
| 06-contacts | contacts | wa-<category>-06-contacts |

Vault root: `/home/laudes/zoot/projects/wiki-builds/work-abroad-web/`

## section_file object schema

```yaml
- section: "01-destinations"
  path: "docs/guides/<category>.section-01-destinations.md"
  status: pending                   # pending | in_progress | completed | failed
  attempts: 0                       # cap at 2; see retry policy below
  last_error: null
  last_error_class: null            # context_exhausted | provenance_missing | task_died | output_invalid | agent_refused
  source_paths:                     # resolved by stage 4 parent (path-passing — not inline content)
    brief: null
    final_report: null
    wiki_notes: []                  # up to 5 paths
    shared_vault_reports: []        # up to 2 paths
    nursing_section: null           # 1 path to the matching H2 extracted from healthcare-nurses.md
  reviewed_against_guide_hash: null # SHA256 of guide at the time stage 5 reviewed this section
```

**Section retry policy:**
- Max 2 attempts per section.
- Retryable classes: `context_exhausted`, `task_died`, `output_invalid`, `provenance_missing`.
- Non-retryable class: `agent_refused` — hard-stop immediately with manual inspection prompt regardless of attempt count.
- After `attempts >= 2` (retryable), stop the pipeline:
  ```
  ✗ Section <slug> has failed 2 times (class: <last_error_class>). Manual inspection required.
  Inspect: docs/guides/<category>.section-<slug>.md
  ```

## shared_vault object schema

```yaml
- vault: "wa-shared-documents"       # slug
  status: reused                     # reused | completed | failed
  vault_path: "/abs/path/or/null"
```

## publish_gate object schema

```yaml
publish_gate:
  unresolved_blocking_todos: 0      # grep count of <!-- TODO: human-review: in guide
  non_primary_corrections_applied: 0  # incremented by stage 5 when Defend fires and was overridden
  unverified_high_risk_claims: 0    # claim markers tier=unverified in sections 03/04/06
  all_sections_reviewed_at_current_hash: false  # true when all gemini_review[i].reviewed_against_guide_hash == state.guide_hash
  passed: false                     # true only when all four checks == 0/true
```

## gemini_review object schema

```yaml
- section: "1. Destination Options"  # exact H2 heading text
  slug: "01-destinations"
  status: pending                    # pending | in_progress | completed
  exchanges_used: 0                  # count of adversarial exchanges (max 4 total across all disagreements)
  todo_flags: 0                      # count of <!-- TODO: human-review --> markers added
  reviewed_against_guide_hash: null  # SHA256 of guide at time of review — must match state.guide_hash for publish
```

The 6 fixed headings (must match guide-template.md canonical H2s):
1. Destination Options — Where Can I Actually Go?
2. Document Checklist — What Papers Do I Need?
3. Realistic Costs — How Much Will This Actually Cost Me?
4. Visa Route Overview — What's the Actual Process?
5. Scam Red Flags — Will I Get Scammed?
6. Legitimate Contacts — Who Do I Actually Call?

## Idempotency rules

1. `stage_status: completed` + re-invocation → advance to next stage; do NOT re-run
2. `stage_status: pending` + re-invocation → run current stage (treat as not yet started)
3. `stage_status: failed` + re-invocation → re-attempt (from failure point, not from scratch)
4. `stage_status: in_progress` + re-invocation → resume (check what sub-steps are done, skip those)
5. `vault.status: completed` → skip in stage 3; do NOT rebuild
6. `vault.status: reused` → skip in stage 3; already on disk
7. `section_file.status: completed` → skip in stage 4; do NOT re-write
8. `gemini_review_status[i].status: completed` → skip in stage 5; do NOT re-review

**Stage 4 file-truth rule (overrides TaskList liveness):** A section is `completed` if and only if its output file exists AND is > 1000 bytes AND contains at least one `<!-- src:` claim marker AND has exactly one `## ` H2 heading. On resume, re-scan all section files and reconcile `status` fields against this truth before spawning any teammates.

## Stage progression table

| current_stage | stage_status | Condition | Next action |
|---|---|---|---|
| 0 | completed | — | Auto-advance: run stage 1 |
| 1 | completed | — | Auto-advance: run stage 2 |
| 2 | completed | — | Hard-exit |
| 3 | completed | Pending vaults remain | Hard-exit (next invocation runs next batch) |
| 3 | completed | All 6 vaults complete/reused | Hard-exit + print REVIEW GATE with manifest hash |
| 4 | pending | No `proceed <hash>` arg supplied | Reprint REVIEW GATE and hard-exit (gate blocks) |
| 4 | pending | `proceed <hash>` arg supplied + hash matches | Precondition check → run stage 4 |
| 4 | completed | — | Auto-advance: run stage 4.5 |
| 4.5 | completed | — | Auto-advance: run stage 5 |
| 5 | completed | — | Hard-exit |
| 6 | pending | — | Run publish_gate check before proceeding |
| 6 | completed | — | Print "Pipeline complete." and stop |

## Per-stage preconditions (checked before running; fail writes `stage_status: failed` + RUN_REPORT)

| Stage | Precondition |
|---|---|
| 3 | `state.prompt_paths` has 6 entries, all files exist on disk |
| 4 | 6 FINAL_REPORTs exist on disk + `state.manifest_hash` matches supplied `proceed <hash>` |
| 4.5 | All 6 section files exist, > 1000 bytes, start with `## `, contain at least one `<!-- src:` marker |
| 5 | `state.synthesis_doc` exists + `state.guide_hash` is set |
| 6 | `publish_gate.passed: true` |

## Run log format

Append one line per significant event to the `## Run log` section at the end of the file:
```
- YYYY-MM-DD HH:MM — <brief description of what happened>
```

Use actual current datetime (read from system clock or use `date` in Bash).
