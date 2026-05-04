# Vault-Builder Agent Spawn Prompt

Use this template when spawning a subagent to run vault-builder for one vault.
Fill in `{{VAULT_PATH}}`, `{{PROMPT_PATH}}`, `{{ITER_CAP}}` before spawning.

---

## Spawn prompt (fill and send to Agent tool)

```
You are running a single vault-builder research run as part of an automated pipeline.

## Your task

1. Read the research prompt file at:
   {{PROMPT_PATH}}

2. Invoke the vault-builder skill with this prompt to build a knowledge vault at:
   {{VAULT_PATH}}

   To invoke vault-builder: use the Skill tool with `skill: "vault-builder"` and follow its
   instructions exactly. Pass these parameters to the skill:
   - vault path: {{VAULT_PATH}}
   - goal file: {{PROMPT_PATH}}
   - iter_cap: {{ITER_CAP}}
   - mode: autonomous (--auto)

3. Let vault-builder run its full autonomous loop (P0 through P7b as documented in the skill).
   Do NOT interrupt it — it manages its own iteration count and convergence.

4. When vault-builder completes, verify:
   - {{VAULT_PATH}}/FINAL_REPORT.md exists and is > 500 bytes
   - {{VAULT_PATH}}/.vault-builder/iter_log.jsonl exists and has at least 1 line
   - {{VAULT_PATH}}/wiki/Conclusion.md exists
   - Count the .md files in {{VAULT_PATH}}/wiki/ (excluding index.md and Conclusion.md)

5. Return a structured result in this exact format:
   ---
   VAULT_BUILD_RESULT
   status: completed | failed
   iter_count: <integer from iter_log.jsonl line count>
   note_count: <integer count of wiki/*.md files excluding index and Conclusion>
   final_report_path: {{VAULT_PATH}}/FINAL_REPORT.md
   iter_log_path: {{VAULT_PATH}}/.vault-builder/iter_log.jsonl
   error: null | <error description>
   ---

## Error handling

If vault-builder exits without producing FINAL_REPORT.md, or if the skill returns an error:
- Report `status: failed` and describe the error in the `error` field.
- Do NOT attempt to re-run vault-builder — the parent pipeline manages retries.
- If a transient tool error occurs (brave-search timeout, defuddle 5xx), retry that specific
  tool call up to 3 times with exponential backoff (5s, 15s, 45s) before marking as failed.

## What NOT to do

- Do NOT modify the research prompt file.
- Do NOT create any files outside {{VAULT_PATH}}.
- Do NOT attempt to verify vault quality — just check the structural success criteria.
- Do NOT ask the user any questions — run autonomously and report results.
```

---

## How to spawn the Agent (for stage-3-vaults.md to follow)

Use the `Agent` tool with:
- `subagent_type`: `general-purpose` (or omit for default)
- `model`: `sonnet`
- `description`: `Build vault wa-<category>-<section>`
- `prompt`: the filled-in spawn prompt above

Wait for the Agent to return its result message. Parse the `VAULT_BUILD_RESULT` block from the response.
