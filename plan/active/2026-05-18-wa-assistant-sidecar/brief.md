---
plan: wa-assistant-sidecar
created: 2026-05-18
status: gemini-reviewed
reviewed: 2026-05-18
---

# Brief: WhatsApp side-car drafting assistant

## Original instruction

> Build a side-car assistant (option 3) that John uses alongside WhatsApp Web. He pastes the inbound message + sender phone number into a Next.js admin page; the assistant matches it against the patterns in `docs/whatsapp-notes/qa-library.md`, drafts a reply that follows the 5 hard rules, and (one tap) appends the turn to `docs/whatsapp-notes/conversations/<phone>.md`. No browser automation of WhatsApp itself — keeps the 061 line outside any ban risk.

## Why this shape

- **Zero ban risk on the only WhatsApp number for the business.** Automating WA Web via Playwright violates ToS and could permanently blacklist 061-711-4715. The side-car is a separate UI; WA Web is untouched.
- **Reuses the corpus we already built today.** `qa-library.md` and `business-profile.md` are the grounding material; this tool gives them a UI.
- **Sized for current volume.** At <20 msgs/day, paste-and-tap is faster than building Cloud API integration (which needs Pty Ltd + Meta verification anyway).

## Evaluation

| Dimension | Status | Notes |
|---|---|---|
| Scope | ✅ | Single admin tool, ~10 files, no schema/migration changes (markdown corpus migration only) |
| Module | ✅ | New: `lib/wa-assistant/`, `app/admin/wa-assistant/`, `app/api/admin/wa-assistant/` |
| Done condition | ✅ | Paste inbound msg → get drafted reply matched to qa-library pattern → Copy button + Log button → conversation file updated; new-pattern suggestions writable via "Add to Library" button |
| Out of scope | — | No prod deployment (filesystem writes are dev-only), no WhatsApp Cloud API, no Playwright/browser automation |

## Hard rules the assistant must enforce (mirrors `docs/whatsapp-notes/README.md`)

1. NEVER name recruiters, employers, hotels, schools, salary ranges, visa fees, or country-by-country requirements.
2. Steer to `https://jobabroad.co.za/register?category=<slug>` for the matching category.
3. NEVER mention R495 / paid tier / pricing upfront.
4. One qualifying follow-up question per reply.
5. Anonymous voice — "we", never "John" or any individual.

Two-layer enforcement:
- **LLM self-flag** (cheap ride-along): system prompt asks model to surface concerns in `ruleViolations`.
- **Deterministic post-pass** (real safety net): server-side regex denylist scans the draft for known violations ("R495", "John", "Paystack", small recruiter denylist). Surfaced in UI alongside LLM signals, tagged by source (`[regex]` vs `[model]`).

## Resolved decisions (post-Gemini review)

| Decision | Choice | Rationale |
|---|---|---|
| Markdown parsing | `marked.lexer()` (already a project dep) — walk tokens for sections. NOT custom regex | Robust to whitespace drift; zero new deps |
| Self-policing rule check | LLM self-flag + deterministic regex post-pass | LLM alone is theatre on the highest-risk leaks; regex catches the explicit denylist deterministically |
| Storage layer | Markdown for v1 (`conversations/<phone>.md`, `contacts.md`). Postgres deferred to Cloud API build | Markdown is the founder's edit surface; YAGNI on query needs at <20 contacts; planned scope boundary |
| OpenAI response shape | Zod schema → `zodResponseFormat` helper (OpenAI 6.x) → `response_format: { type: 'json_schema' }` | Eliminates JSON parse failures cleanly; <30 LOC |
| Pattern ID stability | Add `**ID:** pat_<slug>` line to every qa-library entry. Slug is for display, ID is the foreign key | Cheap design-time decision; prevents data integrity rot when patterns are renamed |
| Prompt injection | Delimit user input with explicit fence + system prompt instructs model to never treat user content as instructions | Real risk; standard mitigation |
| Violations UX | Soft warning (don't block Copy/Log) | Trust the human-in-loop; would be a hard block only if regex denylist hit |
| Log scope | Updates BOTH `conversations/<phone>.md` AND `contacts.md` row (upsert) | Keeps registry canonical |
| Failed-match workflow | "Add to Library" button writes `newPatternSuggestion` directly into `qa-library.md` | Closes the corpus-growth loop |

## Known v1 ceilings (deliberately deferred)

- **Manual prior-context paste won't scale past ~5 turns.** Trigger for v2 auto-thread-load: when ≥5-turn threads become common.
- **Inline qa-library in every prompt.** Switch to embedding retrieval at 50+ patterns.
- **No Playwright spec file.** Manual verification only. Add if the tool becomes mission-critical or if a bug is missed by manual.

## Won't change

- `qa-library.md` format (except adding `**ID:** pat_<slug>` line to each entry)
- `conversations/<phone>.md` format
- Any existing routes or member flows
- `business-profile.md`
