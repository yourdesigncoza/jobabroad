# Error Policy

## Error classes

### Transient errors
Temporary failures that are likely to succeed on retry:
- brave-search MCP timeout or 429 rate-limit
- defuddle 5xx, network timeout
- mcp__gemini-cli__ask-gemini timeout or empty response
- vault-builder subagent context-window pressure causing tool failure

**Handling:** Retry up to 3× with exponential backoff:
- Attempt 1: wait 5s
- Attempt 2: wait 15s
- Attempt 3: wait 45s

If all 3 attempts fail, treat as permanent.

### Permanent errors
Failures that will not resolve by retrying:
- Malformed prompt file (YAML/markdown parse error)
- vault-builder iter_cap reached without producing `FINAL_REPORT.md`
- vault-builder produced empty wiki (0 notes)
- gemini-cli returns an irrelevant or hallucinated response after 3 attempts
- File write permission denied
- Required input file missing (should have been caught by stage 0 pre-flight)

**Handling:** Mark the failing unit (vault, section, gemini review) as `status: failed`, set `last_error` with a specific description, update the state file, and exit the stage handler with this message:
```
✗ Stage <N> failed for <category>: <error description>
Inspect the state file at docs/prompts/<category>/_PIPELINE_STATE.md for details.
Run /build-pathway <category> after resolving the issue to retry.
```

## Per-stage failure modes

### Stage 2 — Prompt generation
- Self-check confidence < 8 after retry: write the file anyway, add `last_error: "confidence <N> after retry"` to state, continue. Downstream failures will surface real problems faster than indefinite retrying.

### Stage 3 — Vault building
- Vault fails (`attempts < 2`): mark `status: failed`, increment `attempts`, continue with remaining vaults in the batch.
- Vault fails (`attempts >= 2`): stop the stage with:
  ```
  ✗ Vault <vault_path> has failed 2 times. Manual inspection required.
  Check: does the prompt at <prompt_path> have valid entities and source constraints?
  ```

### Stage 4 — Synthesis

**Section error classes (set `last_error_class` on each failure):**

| Class | Meaning | Retryable |
|---|---|---|
| `context_exhausted` | Teammate hit context budget limit or truncated | Yes |
| `provenance_missing` | Postcheck found claims without `<!-- src:` markers | Yes |
| `task_died` | Task never returned a result / agent unreachable | Yes |
| `output_invalid` | File missing, < 1000 bytes, or no H2 heading | Yes |
| `agent_refused` | Agent returned a refusal or irrelevant response | No — hard-stop |

**On teammate failure:** set `section_file.status: failed`, `last_error_class: <class>`. Continue waiting for other teammates.

**After TeamDelete:** if any sections failed:
- If any have `last_error_class: agent_refused`: hard-stop immediately — do not offer retry.
- Otherwise exit with:
  ```
  ✗ Stage 4 partial failure: sections <slugs> failed (classes: <list>).
  Run /build-pathway <category> to re-spawn just the failed sections.
  ```
- Append failure details to RUN_REPORT.

**On TeamCreate failure:** reset all just-marked `in_progress` sections to `pending`, write `stage_status: failed`, `last_error: "TeamCreate failed: <error>"`, append RUN_REPORT, hard-exit.

- Re-invocation into a partial stage 4: source of truth is output file existence (see state-schema.md file-truth rule), not TaskList. Re-spawn only sections whose file is absent or invalid.

### Stage 5 — Gemini review
- Gemini returns empty or irrelevant response after 3 attempts: add a `<!-- TODO: human-review: gemini failed to respond -->` marker at the start of that section, mark `status: completed` (do not block the pipeline on a tool failure).

## State on failure

On any permanent failure, write the state file with:
```yaml
stage_status: failed
last_error: "<specific error description, including file paths if relevant>"
```

The run log should include the full error:
```
- YYYY-MM-DD HH:MM — FAILED: <description>
```

On successful recovery (re-invocation that completes the stage), clear `last_error` to `null`.
