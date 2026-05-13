# RUN_REPORT — au-pair pathway build

## Stage 3 batch 1 — 2026-05-13T20:11:16+02:00

**Completed vaults (3/6):**

| Section | Vault | Iters | Notes | FINAL_REPORT SHA256 | Size |
|---|---|---|---|---|---|
| 01-destinations | `wa-au-pair-01-destinations` | 8/8 | 47 | `65c464e1418a11c6a83a2d1945f74d7a16e3e21133b39a2d88b22aa7683c90b3` | 6,993 b |
| 02-documents | `wa-au-pair-02-documents` | 7/6 | 41 | `00ecd18a16454add78ecd1a19293d9d5cab6f113e5abb20c1be5eec8b64b5ab2` | 7,856 b |
| 03-costs | `wa-au-pair-03-costs` | 5/6 | 30 | `2d58cdc43d564851b68cfc356603028e1be81b31a24e924fad5e37838cb61573` | 7,444 b |

**Shared vaults reused:** `wa-shared-documents`, `wa-shared-scams`, `wa-shared-tax-exchange`

**Pending vaults (3):** 04-visa-routes, 05-scams, 06-contacts

**Next action:** `/build-pathway au-pair`

## Stage 3 batch 2 — 2026-05-13T20:52:52+02:00

**Completed vaults (3/3):**

| Section | Vault | Iters | Notes | FINAL_REPORT SHA256 | Size |
|---|---|---|---|---|---|
| 04-visa-routes | `wa-au-pair-04-visa-routes` | 4/10 | 48 | `d4c95e63e32e6a9dc85bf38a39d6ad08b9b1973e5cafd541c2fafed35052a099` | 8,016 b |
| 05-scams | `wa-au-pair-05-scams` | 6/6 | 32 | `a1e9a3beda601df8f246461cb48f40bb3dd166c1195e096329a2d5bf38ca2be1` | 8,618 b |
| 06-contacts | `wa-au-pair-06-contacts` | 5/6 | 37 | `76e918a253e228f89419503835bf466ebc04e6a6c525bd63280466ed41852894` | 8,255 b |

## Stage 3 complete — REVIEW GATE — 2026-05-13T20:52:52+02:00

**All 6 FINAL_REPORTs (SHA256 + size):**

| Section | SHA256 | Size |
|---|---|---|
| 01-destinations | `65c464e1418a11c6a83a2d1945f74d7a16e3e21133b39a2d88b22aa7683c90b3` | 6,993 b |
| 02-documents | `00ecd18a16454add78ecd1a19293d9d5cab6f113e5abb20c1be5eec8b64b5ab2` | 7,856 b |
| 03-costs | `2d58cdc43d564851b68cfc356603028e1be81b31a24e924fad5e37838cb61573` | 7,444 b |
| 04-visa-routes | `d4c95e63e32e6a9dc85bf38a39d6ad08b9b1973e5cafd541c2fafed35052a099` | 8,016 b |
| 05-scams | `a1e9a3beda601df8f246461cb48f40bb3dd166c1195e096329a2d5bf38ca2be1` | 8,618 b |
| 06-contacts | `76e918a253e228f89419503835bf466ebc04e6a6c525bd63280466ed41852894` | 8,255 b |

**Manifest hash:** `68a5e01412ec979ca25e131f999950c2fb39ccbfa7e41bd6455f0fa5db952f0c`

**Quality assessment (Gemini 2.5 Pro + structural):**

| Vault | Verdict | Reason |
|---|---|---|
| 01-destinations | BORDERLINE | Specific actionable data but no source URLs in report; thin coverage of secondary destinations |
| 02-documents | BORDERLINE | Guide-ready specifics on fees/timelines/requirements but no source URLs in report; France slightly thinner |
| 03-costs | PASS | Specific costs, references service-public.fr, no thin sections |
| 04-visa-routes | PASS | 6 official-domain URLs cited, comprehensive coverage of all 4 open routes + closed UK |
| 05-scams | PASS | 9 patterns + 6 verification tools + 8 reporting channels; references state.gov, ind.nl |
| 06-contacts | PASS | Comprehensive coverage, official sources, no thin sections |

**Result:** 4 PASS, 2 BORDERLINE, 0 FAIL. Gate is OPEN — proceed at operator's discretion. BORDERLINE notes refer to the FINAL_REPORT summary not citing URLs inline; the underlying vault notes do contain official sources (verified during Stage 2 prompts).

**Next action:** `/build-pathway au-pair proceed 68a5e01412ec979ca25e131f999950c2fb39ccbfa7e41bd6455f0fa5db952f0c`

---

## Stage 6 — FAILED at publish_gate

**Started:** 2026-05-13T21:45:00+02:00
**Outcome:** Blocked by publish_gate.

| Check | Value | Pass? |
|---|---|---|
| unresolved_blocking_todos | 0 | ✓ |
| non_primary_corrections_applied | 0 | ✓ |
| unverified_high_risk_claims | 5 | ✗ |
| all_sections_reviewed_at_current_hash | true | ✓ |
| **passed** | **false** | — |

### Unverified high-risk claims (5)

| Section | Claim ID | Subject | URL hint |
|---|---|---|---|
| 03-costs | 03-costs-031 | France ANEF validation tax (€225 reserve vs likely €100) | https://administration-etrangers-en-france.interieur.gouv.fr |
| 04-visa-routes | 04-visa-routes-028 | Germany National D visa fee (~€75, PDF inaccessible) | https://southafrica.diplo.de/sa-en/sa-consular/sa-aupair-494644 |
| 04-visa-routes | 04-visa-routes-044 | Belgium au pair permit details (pocket money, eligibility) | https://diplomatie.belgium.be/ |
| 04-visa-routes | 04-visa-routes-045 | Norway au pair permit details (pocket money, age caps) | https://www.udi.no/ |
| 04-visa-routes | 04-visa-routes-046 | Denmark au pair permit details | https://www.nyidanmark.dk/ |

All 5 are already hedged in user-facing prose per the CLAUDE.md unresolved-claims rule (reader sees "verify before applying" / "this guide could not confirm primary-source current requirements"). The hard gate still blocks publish until an operator decides:

**Resolution options:**
1. **Verify and reclassify.** Fetch the 5 primary sources manually, update the figures, and change `tier=unverified` → `tier=primary` in the section files. Then re-run `/build-pathway au-pair` to retry stage 6.
2. **Drop the unverified claims.** If a figure cannot be sourced, remove the specific claim (e.g. delete the "~€75" German visa fee line; collapse Belgium/Norway/Denmark into a single "verify directly with the embassy" pointer with no figures). Re-run stage 6.
3. **Operator override.** If the operator decides hedged-prose treatment is acceptable for these 5, manually edit `state.publish_gate.passed: true` and re-run — but this defeats the gate.

**Recommended path:** Option 2 for Belgium/Norway/Denmark (the recruitment infrastructure for SA candidates on those routes is near-zero anyway, so deleting the figures and keeping just the embassy-verification pointer is cleaner). Then verify ANEF + Germany visa fee on primary sources and reclassify those two.
