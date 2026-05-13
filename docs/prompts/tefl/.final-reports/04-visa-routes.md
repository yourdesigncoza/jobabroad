---
vault: "wa-tefl-04-visa-routes"
goal: "Build a current, source-verified reference of every visa/work-permit route available to South African TEFL teachers in 2025-2026 — covering Korea E-2, Saudi Arabia Iqama, UAE Employment Visa, Vietnam Work Permit + TRC (under Decree 219/2025/ND-CP), China Z-visa, and Spain Auxiliares — with eligibility, processing times, employer sponsorship roles, residency/PR pathways (where they exist), and recent policy changes that affect SA applicants."
created: "2026-05-13"
rounds: 4
nodes: 485
edges: 5783
communities: 7
modularity: 0.27
---

# Final Report: wa-tefl-04-visa-routes

## Goal

Build a current, source-verified reference of every visa/work-permit route available to South African TEFL teachers in 2025-2026 — covering Korea E-2, Saudi Arabia Iqama, UAE Employment Visa, Vietnam Work Permit + TRC (under Decree 219/2025/ND-CP), China Z-visa, and Spain Auxiliares — with eligibility, processing times, employer sponsorship roles, residency/PR pathways, and recent policy changes affecting SA applicants.

## Conclusion

→ [[Conclusion]] — direct answer to the research goal

**SA TEFL teachers have 5 open routes and 1 definitively closed route.** Korea E-2, Saudi Iqama, UAE Employment Visa, Vietnam Work Permit + TRC, and China Z-Visa are all open and accessible for qualified SA applicants. Spain Auxiliares de Conversación is confirmed closed to SA passport holders — there is no bilateral MoU between Spain and South Africa. The 2022-2025 period was highly favourable for SA teachers: both Saudi Arabia and China joined the Apostille Convention (Dec 2022 and Nov 2023 respectively), and Vietnam's Decree 219/2025 substantially reformed and digitised the work permit process.

## What Was Discovered

**Korea E-2** is the most structurally unique route for SA teachers: SA is explicitly named as one of seven permitted nationalities (USA, Canada, UK, Ireland, Australia, NZ, SA), but SA applicants face an SA-specific requirement that no other 7-nation country faces — letters from every school attended from grade 7 through university confirming English-medium instruction. This is the most commonly missed requirement for SA applicants. EPIK sets a practical age cap of 62 (programme-level, not statutory). The visa is valid for 13 months and employer-specific.

**Saudi Arabia Iqama** is the only route with a hard medical exclusion affecting a meaningful portion of SA applicants: HIV-positive individuals cannot obtain a work visa or Iqama — this is a consistently applied Saudi policy with no exceptions. Beyond this, Saudi Arabia is accessible for SA teachers on degree + TEFL basis with no native-speaker visa rule. The 2025 HRSD skill-based classification via Qiwa affects the employer-side process but creates no new eligibility barriers. Saudi Arabia's Apostille accession (Dec 2022) made document preparation substantially simpler.

**UAE Employment Visa** is the most administratively complex route due to the UAE's non-membership in the Apostille Convention. The attestation chain (UAE Embassy in SA → UAE MOFA in UAE → MOHESR degree equivalency for school-sector teachers) adds 4-9 months to the preparation timeline. No native-speaker visa rule applies. School teachers also need KHDA (Dubai) or ADEK (Abu Dhabi) teacher licence approval.

**Vietnam Work Permit + TRC** under Decree 219/2025/ND-CP (effective 7 August 2025) is now a fully digital process via the National Public Service Portal. SA teachers are classified as native English speakers (no IELTS required). The 2-year experience requirement (reduced from 3 years) and the simultaneous CRC+work permit application are significant improvements for SA teachers. The critical SA constraint is the document authentication chain: Vietnam has not joined the Apostille Convention until 11 September 2026 — DIRCO authentication + Vietnamese consular legalisation is required until that date.

**China Z-Visa** benefits from China's November 2023 Apostille accession, which replaced the previously complex multi-step authentication chain. SA is one of seven preferred nationalities. The main market context note: the 2021 Double Reduction policy contracted the private K-12 tutoring sector, though public schools, universities, international schools, and adult language centres continue hiring. The Work Permit Notification process now runs through the MOST portal (fuwu.most.gov.cn) — SAFEA/Foreign Expert Certificate naming is legacy.

**Spain Auxiliares** is confirmed closed for SA applicants via primary source (Spain MEFD official call 2025-2026, BOE publication 11 February 2025). The eligible-countries list includes 37 countries across two application groups; South Africa appears in neither. Structural exclusion: requires bilateral MoU, which does not exist with South Africa.

## Graph Structure

- Nodes: 485 | Edges: 5,783 | Communities: 7 | Modularity: 0.27
- Top concepts by betweenness centrality: qiwa, decree, visa, south, ministry, spain, foreign, immigration, arabia, international
- Key bridges: qiwa (links Saudi/HRSD cluster to general employment concepts), decree (bridges Vietnam policy cluster to general framework), visa (cross-route connector)

## Gaps That Remain Open

1. **Korea E-2 regulatory basis for English-medium schooling requirement** — EPIK's required documents page is explicit, but whether this is a Ministry of Justice immigration regulation or an EPIK programme-level rule has not been confirmed from a primary government regulatory text (visa.go.kr or moj.go.kr).

2. **UAE MOHESR scope** — Whether MOHESR degree equivalency applies to language-centre English teachers (working under general employment rules) or only to K-12 school-sector positions is unclear from current sources. Industry guidance consistently mentions it for school teachers; not explicitly confirmed for language centre roles.

3. **Vietnam simultaneous CRC+WP portal** — Decree 219 enables simultaneous criminal record + work permit application via the National Public Service Portal, but as of late 2025 provincial implementation varies. No primary source confirms which provinces have fully activated this feature.

4. **Saudi Arabia TEFL hour specification** — Industry sources consistently state 120-hour TEFL minimum for Saudi Arabia, but primary HRSD/MOFA regulatory documents do not specify a TEFL hour count. Confirmed as employer-driven rather than visa-law-driven, but the exact threshold Saudi employers apply could be confirmed via a sector survey.

5. **Spain and SA dual citizens** — Whether SA-born applicants holding dual citizenship with an eligible-country (e.g., UK or Irish citizenship) can participate in the Auxiliares programme through that citizenship was not explicitly confirmed. Likely yes (if they apply as UK/Irish citizens), but not directly verified from the MEFD rules.

## What Could Not Be Confirmed from Public Sources

- **Korea E-2 minimum salary requirement** — Korea sets minimum salary for E-2 holders but the specific amount was not confirmed from primary sources in this research. Some industry sources cite approximately 1.5-2 million KRW/month minimum; primary source verification (Korean Ministry of Justice) was not achieved.
- **UAE employer minimum salary threshold for work permit** — MOHRE sets sector-specific salary floors; the applicable threshold for English teachers was not confirmed.
- **Vietnam native-speaker list primary source** — The seven-country native-speaker list in Vietnam's framework is confirmed by industry sources and referenced to Circular 21/2018/TT-BGDDT, but the primary ministry circular was not fetched in full.

## Suggested Next Steps

1. **Verify Korea E-2 schooling letter regulatory basis** — Fetch visa.go.kr or moj.go.kr E-2 eligibility text directly to confirm whether the English-medium schooling requirement is statutory or EPIK programme-only. This affects whether hagwon employers also require the letters.

2. **UAE MOHESR scope clarification** — Fetch MOHESR website (mohesr.gov.ae) for the list of regulated professions requiring equivalency assessment. Confirm whether TEFL language centre teacher falls within or outside the regulated professions list.

3. **Vietnam Circular 21/2018/TT-BGDDT** — Fetch the primary text to confirm the seven-country native-speaker list from Ministry of Education and Training directly.

4. **Spain 2026-2027 call** — When the 2026-2027 Auxiliares call is published (typically February 2026), check the eligible-countries list for any SA addition. Run `/vault-builder` update on this note.

5. **Saudi TEFL hour primary source** — Check qiwa.sa or HRSD guidelines for any specification of minimum TEFL hours for English teacher work permit classification.

## Vault Health

- Unresolved wikilinks: 0
- Heading-only notes: 0
- Orphan root files: 0
- Alias conflicts: 0
- Invariants: PASSED

---

## Notes Summary

| Category | Count |
|---|---|
| Visa Route notes | 6 |
| Policy Change notes | 4 |
| Government Body notes | 6 |
| Entity/Cross-cutting notes | 2 |
| Stub notes | 16 |
| Conclusion | 1 |
| Open Questions | 1 |
| **Total** | **36 notes** |

Vault path: `/home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-04-visa-routes`
