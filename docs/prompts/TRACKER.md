# Vault-Builder Prompt Tracker

Run shared vaults first — nursing prompts cross-reference them.

**Status:** `[ ]` not started · `[~]` in progress · `[x]` complete

---

## Shared Vaults

| Status | Prompt | Vault | Iter | Notes |
|---|---|---|---|---|
| [x] | [SA Documents Universal](shared/sa-documents-universal.md) | `wa-shared-documents` | 2 | 27 notes, 361 nodes, FINAL_REPORT done |
| [x] | [Scam Patterns](shared/scam-patterns.md) | `wa-shared-scams` | 5 | 31 notes, 602 nodes, FINAL_REPORT done |
| [x] | [SA Migration Companies](shared/sa-migration-companies.md) | `wa-shared-migration-cos` | 8 | 58 notes, 650 nodes, FINAL_REPORT done |
| [x] | [SA Regulatory Bodies](shared/sa-regulatory-bodies.md) | `wa-shared-regulatory-bodies` | 3 | 46 notes, 509 nodes, FINAL_REPORT done |
| [x] | [Regulatory Boundary](shared/regulatory-boundary.md) | `wa-shared-legal-boundary` | 6 | 22 notes, 389 nodes, FINAL_REPORT done |
| [x] | [SA Tax & Exchange Control](shared/sa-tax-exchange.md) | `wa-shared-tax-exchange` | 6 | 33 notes, 751 nodes, FINAL_REPORT done |

---

## Nursing (separate vaults per prompt)

| Status | Prompt | Section | Iter | Notes |
|---|---|---|---|---|
| [x] | [01 — Destination Options](nursing/01-destination-options.md) | How do I get there? | 10 | 45 notes, 686 nodes, FINAL_REPORT done — vault: wa-nursing-01-destinations |
| [x] | [02 — Document Checklist](nursing/02-document-checklist.md) | What papers do I need? | 8 | 34 notes, 330 nodes, FINAL_REPORT done — vault: wa-nursing-02-documents |
| [x] | [03 — Realistic Costs](nursing/03-realistic-costs.md) | How much will it cost? | 8 | 47 notes, 525 nodes, FINAL_REPORT done — vault: wa-nursing-03-costs |
| [x] | [04 — Visa Routes](nursing/04-visa-routes.md) | How do I get there? | 8 | 28 notes, 534 nodes, FINAL_REPORT done — vault: wa-nursing-04-visa-routes |
| [x] | [05 — Scam Red Flags](nursing/05-scam-red-flags.md) | Will I get scammed? | 6 | 25 notes, 514 nodes, FINAL_REPORT done — vault: wa-nursing-05-scams |
| [x] | [06 — Legitimate Contacts](nursing/06-legitimate-contacts.md) | Who do I contact? | 7 | 45 notes, 531 nodes, FINAL_REPORT done — vault: wa-nursing-06-contacts |

---

## Teaching (separate vaults per prompt)

| Status | Prompt | Section | Iter | Notes |
|---|---|---|---|---|
| [x] | [01 — Destination Options](teaching/01-destination-options.md) | Where can I teach? | 6 | 44 notes, FINAL_REPORT done — vault: wa-teaching-01-destinations |
| [x] | [02 — Document Checklist](teaching/02-document-checklist.md) | What papers do I need? | 5 | 37 notes, FINAL_REPORT done — vault: wa-teaching-02-documents |
| [x] | [03 — Realistic Costs](teaching/03-realistic-costs.md) | How much will it cost? | 5 | 44 notes, FINAL_REPORT done — vault: wa-teaching-03-costs |
| [x] | [04 — Visa Route Overview](teaching/04-visa-routes.md) | How do I get there? | 7 | 50 notes, FINAL_REPORT done — vault: wa-teaching-04-visa-routes |
| [x] | [05 — Scam Red Flags](teaching/05-scam-red-flags.md) | Will I get scammed? | 6 | 16 notes, FINAL_REPORT done — vault: wa-teaching-05-scams |
| [x] | [06 — Legitimate Contacts](teaching/06-legitimate-contacts.md) | Who do I contact? | 5 | 29 notes, FINAL_REPORT done — vault: wa-teaching-06-contacts |

---

## Seasonal (separate vaults per prompt)

| Status | Prompt | Section | Iter | Notes |
|---|---|---|---|---|
| [x] | [01 — Destination Options](seasonal/01-destination-options.md) | Where can I actually go? | 5 | 26 notes, FINAL_REPORT done — vault: wa-seasonal-01-destinations |
| [x] | [02 — Document Checklist](seasonal/02-document-checklist.md) | What papers do I need? | 7 | 46 notes, FINAL_REPORT done — vault: wa-seasonal-02-documents |
| [x] | [03 — Realistic Costs](seasonal/03-realistic-costs.md) | How much will it cost? | 6 | 37 notes, FINAL_REPORT done — vault: wa-seasonal-03-costs |
| [x] | [04 — Visa Route Overview](seasonal/04-visa-routes.md) | What's the actual process? | 7 | 38 notes, FINAL_REPORT done — vault: wa-seasonal-04-visa-routes |
| [x] | [05 — Scam Red Flags](seasonal/05-scam-red-flags.md) | Will I get scammed? | 5 | 21 notes, FINAL_REPORT done — vault: wa-seasonal-05-scams |
| [x] | [06 — Legitimate Contacts](seasonal/06-legitimate-contacts.md) | Who do I actually call? | 6 | 26 notes, FINAL_REPORT done — vault: wa-seasonal-06-contacts |

---

## Other Categories (prompts not yet built)

| Status | Category | Vault | Prompts Built |
|---|---|---|---|
| [ ] | IT / Tech | `wa-it-tech` | No |
| [ ] | Engineering | `wa-engineering` | No |
| [x] | Teaching | `wa-teaching` | Yes — 6 prompts written, 6 vaults complete |
| [ ] | Accounting | `wa-accounting` | No |
| [x] | Seasonal | `wa-seasonal` | Yes — 6 prompts written, vaults pending |

---

## Guide Content (post-research)

| Status | Task | Depends on |
|---|---|---|
| [x] | Write `docs/guides/healthcare-nurses.md` from vault content | All nursing prompts complete |
| [ ] | Write `docs/wiki/` shared nodes from vault content | All shared prompts complete |
| [ ] | Build `lib/pathway-content.ts` | Guides written |
| [ ] | Build `app/members/[token]/page.tsx` | pathway-content.ts |
| [ ] | Supabase schema for wiki ingestion | Guides + wiki complete |
