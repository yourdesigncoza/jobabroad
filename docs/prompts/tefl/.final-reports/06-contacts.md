---
vault: "wa-tefl-06-contacts"
goal: "Build a verified directory of legitimate TEFL programme operators (EPIK, SMOE, GEPIK, JET, Auxiliares de Conversacion), destination labour/immigration authorities, accredited TEFL certificate issuers (Cambridge CELTA, Trinity CertTESOL, Ofqual-regulated Level 5 providers), SA-side service providers (DIRCO, SAQA, SAPS) and reputable SA/international recruiters — with scope, official URLs, application fee, and known reputation signals."
created: "2026-05-13"
rounds: 6
nodes: 490
edges: 5463
communities: 9
modularity: 0.3587
---

# Final Report: wa-tefl-06-contacts

## Goal

Build a verified directory of legitimate TEFL programme operators (EPIK, SMOE, GEPIK, JET, Auxiliares de Conversación), destination labour/immigration authorities, accredited TEFL certificate issuers (Cambridge CELTA, Trinity CertTESOL, Ofqual-regulated Level 5 providers), SA-side service providers (DIRCO, SAQA, SAPS) and reputable SA/international recruiters — with scope, official URLs, application fee, and known reputation signals.

## Conclusion
→ [[Conclusion]] — direct answer to the research goal

SA candidates have **two confirmed government-backed, no-fee programme routes** (EPIK/Korea and JET/Japan), **three universal certificate gatekeepers** (CELTA, CertTESOL, Ofqual Level 5), and a **three-step SA document chain** (SAQA→SAPS→DIRCO) that typically takes 6–10 weeks. Spain's Auxiliares programme is definitively closed to SA applicants. Apostille Convention membership by Korea, Saudi Arabia, UAE, and China (but not Vietnam until 11 September 2026) determines which DIRCO service is needed.

## What Was Discovered

**Programme Operators:** EPIK is South Korea's largest government-sponsored public school programme, explicitly open to SA citizens (one of seven eligible nationalities for the E-2 visa). The official recruiting partner is Korvia (free to candidates, official since 2008). SMOE and GEPIK are legacy names for Seoul and Gyeonggi Province placements — both absorbed into EPIK in 2016 and accessed via regional preference in the EPIK application. JET Programme is Japan's bilateral government programme; SA candidates apply only via the Embassy of Japan in Pretoria (paper application, annual deadline ~October). The Spain Auxiliares de Conversación programme is confirmed closed to SA applicants — South Africa is not on the eligible countries list and this fact needed to be documented clearly to prevent misdirected applications.

**Accreditation Bodies:** Cambridge Assessment English (CELTA, Ofqual 600/2402/1, Level 5 RQF) and Trinity College London (CertTESOL, Ofqual Level 5 RQF) are the two universally recognised initial TEFL qualifications. Ofqual at register.ofqual.gov.uk is the canonical verification database. SA TEFL centres confirmed: Good Hope Studies (Cape Town) and International House Johannesburg. The CELTA/CertTESOL distinction is important: both are accepted by all major TEFL destinations; neither is superior for SA candidates; the choice should be made on cost, location, and schedule.

**SA-Side Services:** DIRCO (free; OR Tambo Building, Pretoria; email legalisation@dirco.gov.za) handles apostilles and authentications. SAQA (verificationsletter@saqa.co.za) handles degree verification letters with a minimum 25-working-day official time but commonly takes months — start early. SAPS CRC issues Police Clearance Certificates for R190 in ~15 working days. The order matters: SAQA first, then DIRCO (DIRCO apostilles the SAQA letter, not the original degree).

**Destination Government Bodies:** Korea's E-2 visa is issued by the Embassy of Korea in Pretoria (265 Melk Street; visas: 012 762 3800; visasectionk@mofa.go.kr). Saudi Arabia's document chain is simplified since joining the Apostille Convention (December 2022) — DIRCO apostille alone is now sufficient. UAE's KHDA (Dubai) recognises CELTA, DELTA, TESOL for English language teaching roles; ADEK covers Abu Dhabi. Vietnam uses Decree 219/2025/ND-CP; SA is listed as a native English-speaking country; document legalisation requires DIRCO authentication + Vietnamese consular step until 11 September 2026. China requires the Z Visa/Foreigner Work Permit via fuwu.most.gov.cn; joined Apostille Convention November 2023.

**Recruiter Landscape:** Korvia is EPIK's exclusive official partner — free to candidates and confirmed by epik.go.kr. JET requires no recruiter. For private-market destinations, SA-based recruiters must be registered as Private Employment Agencies with the Department of Employment and Labour (register at labour.gov.za). No SA recruiter should charge a placement fee to access the government programmes (EPIK, JET).

## Graph Structure
- Nodes: 490 | Edges: 5463 | Communities: 9 | Modularity: 0.3587
- Top concepts: programme, english, epik, korea, department
- Key bridges: programme (links accreditation ↔ destination clusters), english (links SA services ↔ programme operator clusters)

## Gaps That Remain Open

1. **ADEK (Abu Dhabi) specific requirements** — detailed ADEK qualification requirements were not fetched from adek.gov.ae; the note documents the existence of the body but specific CELTA/TEFL acceptance criteria and document requirements need primary-source verification.

2. **Vietnam post-September 2026 apostille transition** — Decree 219/2025 is documented but the specific procedure for SA applicants once Vietnam enters the Apostille Convention (11 September 2026) needs confirmation from the Vietnamese Embassy in Pretoria.

3. **SA recruiter registry currency** — the DEL PEA register PDFs were last updated January 2020 in the version accessed; an up-to-date list needs to be confirmed directly with labour.gov.za.

4. **SAQA actual processing time** — the official figure is 25 working days but user reports consistently indicate 2–4 months. No primary-source data was found to resolve this discrepancy.

5. **GEPIK 2026 separate quota** — Korvia's location guide suggests GEPIK may have its own application cycle and salary tweaks; the exact 2026 GEPIK-specific terms were not fetched from goe.go.kr.

## What Could Not Be Confirmed from Public Sources

- The specific SACM (Saudi Cultural Mission) additional authentication requirements for SA teachers — whether it applies in any SA teaching context post-Apostille-Convention accession remains unresolved; the source noted it "may" apply in some educational contexts but did not specify when.
- ADEK-specific teacher licensing requirements from adek.gov.ae (website content was not crawled).
- Current SAQA fee schedule — the quotation-based model means no fixed public fee table exists.

## Suggested Next Steps

1. **Verify ADEK requirements directly** — go to adek.gov.ae and check the teacher appointment technical guide to confirm CELTA/CertTESOL acceptance and document attestation requirements for SA teachers in Abu Dhabi.
2. **Contact Vietnamese Embassy in Pretoria** about the September 2026 transition — ask specifically: after 11 September 2026, will a DIRCO apostille be accepted without the additional Vietnamese consular legalisation step?
3. **Check DEL PEA register currency** — go to labour.gov.za → Documents → Private Employment Agencies and download the current national list; confirm whether any SA-based TEFL recruiter mentioned in outreach appears on the register.
4. **Seed next research with Saudi international school recruiters** — the Saudi market has no government programme equivalent to EPIK; researching the top 3–5 reputable recruiters placing SA teachers in Saudi Arabia would complete the directory for that destination.
5. **Research Vietnam-specific TEFL recruiters** — Vietnam has an active private-school market for SA teachers but no government programme; document 2–3 confirmed recruiters active in the Vietnam market with transparent fee models.

## Vault Health
- Unresolved wikilinks: 0
- Heading-only notes: 0
- Orphan root files: 0
- Alias conflicts: 0
- Invariants: ✓ PASSED
