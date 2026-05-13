---
vault: "wa-tefl-03-costs"
goal: "Build a verified, itemised cost reference for a South African TEFL teacher relocating to South Korea, Saudi Arabia / UAE, Vietnam, China, or Spain"
created: "2025-05-13"
rounds: 6
nodes: 420
edges: 7562
communities: 5
modularity: 0.1951
---

# Final Report: TEFL Costs for SA Teachers — wa-tefl-03-costs

## Goal
Build a verified, itemised cost reference for a South African TEFL teacher relocating to South Korea, Saudi Arabia / UAE, Vietnam, China, or Spain — covering every fee from SA-side documentation through TEFL certification through visa and flight, presented as low / mid / high scenarios per destination, with explicit note of what the employer typically covers vs. what the teacher pays.

## Conclusion
→ [[Conclusion]] — Saudi Arabia and Abu Dhabi (UAE) have the lowest net out-of-pocket cost for SA candidates (~R32,000–R38,000 effective outlay after employer reimbursements). Vietnam requires the largest cash buffer (R60,000–R68,000). Spain's government programme (Auxiliares) is closed to SA nationals. Korea and China are mid-range.

## What Was Discovered

### SA Documentation Costs (Confirmed from Primary Sources)
- **SAPS Police Clearance Certificate**: R190 (official, saps.gov.za, 2025)
- **DIRCO Apostille**: Free government fee; courier/concierge adds R500–R2,000; High Court route faster (1–2 days)
- **SAQA Individual Verification Letter**: R320 (official SAQA tariff 2024-25/2025-26)
- **Total SA documentation baseline**: ~R2,500–R4,500 depending on route choice

### TEFL Certification Options (Both Researched)
- **In-person CELTA (SA)**: R21,900 (Johannesburg) or R22,434–R24,999 (Cape Town) — confirmed from StudyCELTA booking data
- **Ofqual Level 5 TEFL online**: ~R4,100–R5,700 — ~75–80% cheaper; lacks supervised teaching practice; accepted by Gulf/China/Vietnam employers

### Key Cost-Shaping Discoveries

**Apostille Convention status is the most important cost variable after TEFL certification:**
- Saudi Arabia acceded December 2022 → DIRCO apostille only (no Embassy chain) — saves R2,000–R5,000
- China acceded November 2023 → DIRCO apostille only — same saving
- Vietnam NOT yet a signatory (expected September 2026) → authentication + consular legalisation = highest document cost of all destinations

**Spain government programme is confirmed RESTRICTED for SA nationals.** The MEFD Auxiliares 2025–2026 call lists 35+ eligible countries; South Africa is not on the list and has no Memorandum of Understanding with Spain. SA teachers must use fee-paying private programmes (CIEE $2,350, Meddeas, ConversaSpain) — shifting Spain from the cheapest government option to the most expensive private option.

**EPIK 2026: Level 3 (no TEFL) applicants are not hired anywhere in Korea.** TEFL certification is effectively required for all Korea placements. A 100h+ TEFL certificate moves a candidate to Level 2 (KRW 2,100,000–2,350,000/month in most provinces).

**China Z visa for SA passport: R300 confirmed** (Chinese Consulate Johannesburg, fee policy extended to December 2026) — the lowest visa application fee of all five destinations.

### Destination-Level Cost Summary

| Destination | Initial Outlay | Net After Employer Reimbursement | Monthly Salary (ZAR approx) |
|---|---|---|---|
| Saudi Arabia | ~R40,000–R42,000 | ~R32,000–R34,000 | R57,000–R95,400 (tax-free) |
| UAE Abu Dhabi | ~R38,000–R40,000 | ~R28,000–R30,000 | R62,976–R104,448 (tax-free) |
| UAE Dubai | ~R64,000 | ~R40,000–R50,000 | R61,440–R112,640 (tax-free, but KHDA PD cost) |
| Korea (EPIK, non-Seoul) | ~R50,000 | ~R29,000 (after entrance allowance) | R26,520/month (KRW 2.3M) |
| China (Tier 2 city) | ~R44,000–R46,000 | ~R35,000–R37,000 | R28,860/month (CNY 13K) |
| Vietnam (HCMC) | ~R60,000–R68,000 | ~R60,000–R68,000 (minimal reimbursement) | R25,200/month (VND 35M) |
| Spain (private programme) | ~R130,000–R155,000 | ~R130,000–R155,000 | Stipend ~R16,000/month |

## Graph Structure
- Nodes: 420 | Edges: 7,562 | Communities: 5 | Modularity: 0.20
- Top concepts: south, official, teacher, visa, fee, saudi, korea, dirco, saqa, course
- Key bridges: `official` (BC 0.074) — connects government fee documentation to all destinations; `visa` (BC 0.049) — connects document chain to destination-specific requirements

## Gaps That Remain Open

1. **Korea E-2 visa fee for SA passport holders** — Confirmed unresolved: Korean Embassy Pretoria page states fee varies by nationality; no ZAR amount confirmed from primary source. The vault uses R1,500 placeholder. Candidates should call 012 762 3800 or email visasectionk@mofa.go.kr before relying on the Korea Cost Scenario figure.

2. **Ofqual Level 5 TEFL exact ZAR prices** — Specific 2025 ZAR pricing was not accessible as plain text from provider pages. Figures in vault (R4,100–R5,700) are estimates based on GBP/USD price ranges visible in search results; marked `alleged`.

3. **DIRCO courier fees exact upper/lower bounds** — The R500–R2,000 range is based on multiple service providers' general guidance; no single official fee schedule exists for third-party services.

4. **UAE and Spain visa fees** — UAE employment visa fee (typically employer-arranged, ~R500–R1,000 teacher contribution) and Spain private-programme working visa fee (~R3,000–R5,000) are estimated; not confirmed from official primary sources.

## What Could Not Be Confirmed from Public Sources

- **Korea E-2 visa application fee in ZAR at the Pretoria Embassy** — Primary source (embassy page) explicitly declines to publish a rate and refers applicants to confirm directly.
- **SAQA Individual Verification Letter exact fee split** — R320 cited from tariff notice headline; the PDF distinguishes between organisational and individual verification fees. The R320 is the confirmed individual applicant fee, but the PDF detail was not fully accessible.
- **China MOST Foreigner Work Permit portal fees** (fuwu.most.gov.cn) — The specific fee schedule was not accessed; employer typically handles this.
- **Saudi Embassy Pretoria attestation fees** — No longer required post-Dec 2022 Apostille accession; not researched as it is now the obsolete route.

## Suggested Next Steps

1. **Confirm the Korea E-2 visa fee** by calling the Korean Embassy Pretoria visa section directly: 012 762 3800 / visasectionk@mofa.go.kr.

2. **Add low/high scenarios for Saudi, UAE, Vietnam, and China** — only Korea has explicit low/high variants in this vault. The pattern is established; the other destinations need the same treatment for the published pathway guide.

3. **Add China and UAE low/high scenario variants** following the Korea pattern (low = Level 5 online TEFL, DIY document processing; high = in-person CELTA, Cape Town, premium intake).

4. **Monitor Vietnam Apostille Convention accession** — if the September 2026 schedule holds, the Vietnam Cost Scenario should be updated to replace the consular legalisation chain with a DIRCO apostille, reducing teacher-side document costs by R800–R1,500.

5. **Verify SAQA fee from the full PDF** at saqa.org.za/wp-content/uploads/2024/04/Verification-New_Tarriffs-2024-25-202404-Final.pdf to confirm the R320 individual verification letter fee for the 2025-26 tariff year specifically.

## Vault Health
- Unresolved wikilinks: 0
- Heading-only notes: 0
- Orphan root files: 0
- Alias conflicts: 0
- Invariants: ✓ PASSED
