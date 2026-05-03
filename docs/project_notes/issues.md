# Issues & Completed Work

## Completed

### [2026-05-03] Extend nursing destinations vault (rounds 5–9)

Extended `wa-nursing-01-destinations` vault from round 4 (28 notes) to round 9 (**46 notes**, 18 raw sources). Autonomous mode ran 5 additional research rounds covering: AHPRA OBA pathway for SA nurses, aged care demand, Ireland HSE relocation package, NZ Green List Tier 1, Canada NCLEX-RN pass rate, SA R425 training profile, occupation lists, midwifery registration, Ireland specialties, and Subclass 186 DE visa.

**Critical facts surfaced (correct misinformation in common online guides):**
- SA nurses cannot use AHPRA's streamlined Pathway 1 (4–6 weeks) — must use Standard OBA Pathway (3–6 months)
- Ireland HSE relocation package pays flights + 4 weeks accommodation + €1,500–3,000 (directly confirmed)
- NZ Green List Tier 1 = Straight to Residence from day one — fastest PR of all destinations
- NCLEX-RN first-time pass rate for internationally educated nurses: 54.5% (Q3 2024) — Canada's key risk factor
- SA R425 training covers all 4 nursing domains (general, psychiatric, community, midwifery) — uniquely broad vs competitors
- Ireland recruits for Mental Health and Community Services, not just acute hospitals — SA nurses with psychiatric training are directly eligible via KCR
- SA itself faces 34,000 nurse deficit by 2025 (1.3 per 1,000 vs WHO recommendation of 4.45)

**Vault health at completion:** 0 unresolved wikilinks, 0 heading-only notes, 0 orphan files. All invariants passed.

**New notes created this session:** Australian Aged Care Sector, Ireland Community Nursing, Primary Care Nursing, SA Nurse Training Profile, Mental Health Nursing, Midwifery, Occupation Lists for Nursing, Subclass 186 Employer Nomination Scheme. KCR note promoted from stub to entity with full specialty list. South African Nursing Council and NZ Green List promoted and enriched.

---

### [2026-05-03] Build legal-boundary research vault

Built `wa-shared-legal-boundary` knowledge vault at `/home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-shared-legal-boundary/` using the vault-builder skill, seeded from `docs/prompts/shared/regulatory-boundary.md`.

**Output:** 22 wiki notes covering the legal boundary between permitted immigration information and regulated advice across 6 jurisdictions (UK, Australia, NZ, Canada, SA, Ireland).

**Key finding:** Jobabroad is legally safe as an information-only product in all 6 jurisdictions, provided content is not tailored to a specific named individual. SA is fully unregulated (s.46 repealed 2014). NZ and Canada are highest-risk (extraterritorial scope) but general guides remain safe. See `wiki/Conclusion.md` and `FINAL_REPORT.md` for the full verdict and standard disclaimer language.

**Gaps still open:**
- Australia Migration Act s.280 full territorial scope (MARA website blocked automated access)
- Canada IRPA s.91 "for consideration" applied to paid general information guides — grey area
- NZ offshore prosecution in practice (no enforcement cases found against general info providers)

---

### [2026-05-03] Build SA documents research vault
Built `wa-shared-documents` knowledge vault at `/home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-shared-documents/` using the vault-builder skill, seeded from `docs/prompts/shared/sa-documents-universal.md`.

**Output:** 26 wiki notes covering the full SA work-abroad document chain:
- Documents: SAPS PCC, Apostille (DIRCO), SA Passport, UBC, SAQA Foreign Qual Eval, Medical Clearance, Proof of Funds
- Issuing bodies: SAPS, DIRCO, DHA, SAQA, IOM MHAC, VFS Global SA
- Supporting stubs: UK Work Visa, Australia Skilled Migration, Hague Convention, eHomeAffairs, Apostil.co.za, Qline Document Services, etc.

**Key finding:** Critical path is Passport → PCC (6-12 weeks) → DIRCO Apostille (6-7 weeks). Total lead time 3-6 months; total cost R3,000–R15,000 depending on fixer use.

**Gaps still open:**
- SAQA Verification of National Qualifications fee/time (saqa.org.za SSL blocks WebFetch)
- IOM exact fee schedule (403 on healthcentres.iom.int)
- Professional body recognition per destination (HPCSA, ECSA, SAICA — not yet covered)
- UAE/Gulf non-Hague attestation chain

---

### [2026-05-03] Build scam patterns research vault

Built `wa-shared-scams` knowledge vault at `/home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-shared-scams/` using the vault-builder skill, seeded from `docs/prompts/shared/scam-patterns.md`.

**Output:** 32 wiki notes covering 8 scam patterns, 3 verification methods, 1 scam actor type, 14+ supporting stubs (regulatory bodies, legal frameworks, reporting channels).

**Scam patterns documented (all full notes):**
- Fake Job Offer Scam, Upfront Visa Fee Fraud, Fake Recruitment Agency
- Phantom Interview Scam, LinkedIn Recruiter Impersonation
- Advance Fee Fraud (419), WhatsApp Global Group Placement Scam
- Identity Document Fraud

**Verification methods documented:**
- DHA Visa Check (VisaVerifications.Missions@dha.gov.za / 012 406 4432)
- UK Register of Licensed Sponsors (gov.uk)
- UAE MOHRE Employer Check (mohre.gov.ae)

**Scam actor types documented:**
- Scam Compound Operator — Southeast Asia trafficking networks confirmed to be targeting SA youth aged 18–35; 41 South Africans held at Myanmar's KK Park in October 2025 (confirmed, The Witness / DIRCO)

**Key findings for content:**
- Universal rule: Employment Services Act bans all recruitment fees — any fee = scam
- SA leads Africa in scam losses ($800/victim avg, 2024); job scams up 30%+ per SABRIC
- Trafficking endpoint confirmed: Facebook ads → Thailand flights from OR Tambo/CPT/DUR → passport confiscation → Myanmar compounds
- SAFPS Protective Registration is free — register any stolen ID/passport immediately

**Gaps still open:**
- Australian employer verification register equivalent (not documented)
- Named prosecutions/convictions for SA fake recruiters (SAPS commercial crime data not public)
- Dept of Labour deregistered-agency blacklist (existence not confirmed)
- WhatsApp Global Group specific fee amounts and named instances

---

### [2026-05-03] Build nursing document checklist research vault

Built `wa-nursing-02-documents` knowledge vault at `/home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-02-documents/` using the vault-builder skill, seeded from `docs/prompts/nursing/02-document-checklist.md`.

**Output:** 19 wiki notes covering the complete document checklist for SA nurses applying to work in the UK, Australia, and Ireland — using the brief's custom DOCUMENT and EXAM note schemas.

**Documents mapped (full notes):**
- SANC Certificate of Good Standing — foundational SA-side document; direct-ships to all destination bodies
- NMC CCPS — UK nurses' letter of good standing; 24hr processing; direct-ships to overseas bodies
- AHPRA IQNM Application — Australia practice registration; requires ANMAC assessment first
- NMBI Registration Application — Ireland; €495 total (€350 recognition + €145 registration)
- ANMAC Qualification Assessment — Australia migration visa pathway; separate from AHPRA; ~AUD $395–$545; 6–8 weeks

**Exams mapped (full notes):**
- CBT NMC Part 1 — Pearson VUE worldwide inc. SA; Part A 15 numeracy + Part B 100 MCQ; £83; pass = 60% + 90% critical questions; 3 attempts/year
- OSCE — NMC Part 2; 10 stations; £794; UK-only (must travel); 3 attempts max; Northumbria centre closed Feb 2026
- IELTS Academic — Band 7.0 all 4 skills (NMC zero tolerance; NMBI allows 6.5 minimum per band); 2-year validity
- OET — Grade B all 4 skills; preferred by ~70% of nurses; accepted by NMC, AHPRA, NMBI

**Key findings:**
- Universal sequencing trap: destination application must precede SANC CoGS request (SANC direct-ships; needs receiving body's details)
- UK total pathway cost: ~£1,170 (eval £140 + CBT £83 + OSCE £794 + registration £153); 18–30 month timeline
- Australia has TWO separate processes: ANMAC (migration visa) and AHPRA (practice rights) — both need SANC CoGS sent directly
- NMBI does NOT allow combining IELTS sittings; NMC does (within 6 months)
- OSCE is the highest-risk bottleneck: UK travel required, 3 attempts max, 6-month penalty if all fail

**Gaps still open:**
- SANC CoGS cost in ZAR and official processing time (sanc.co.za returned HTTP 403)
- UK Health and Care Worker Visa requirements (explicitly in brief but not yet researched)
- SA Pearson VUE test centre cities for CBT
- IELTS/OET ZAR cost and SA test centres
- AHPRA registration fees in AUD
- NMBI processing time (anecdotal: 3–6 months — unconfirmed)
- NMBI G1/G2/G3 classification for SA-trained nurses
- ANMAC Full Skills Assessment exact fee

---

### [2026-05-03] Build nursing legitimate contacts vault (wa-nursing-06-contacts)

Built `wa-nursing-06-contacts` vault at `/home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-06-contacts/` using the vault-builder skill, seeded from `docs/prompts/nursing/06-legitimate-contacts.md`.

**Output:** 46 wiki notes, 7 research rounds, 531 nodes, 8,434 edges, modularity 0.196. All wikilink invariants passed (0 unresolved, 0 heading-only, 0 orphan root files).

**Verified destination regulators (4):**
- NMC (UK) — CBT £83 + OSCE £794 + registration £153 ~= £1,030 total; 3–6 months; IELTS 7.0 all / OET B
- AHPRA (Australia) — SA nurses use Stream B general pathway (9–12 months, MCQ + OSCE in AU, ~AUD 410); Pathway 1 (1–3 months) excluded for SA direct-register
- NMBI (Ireland) — Group 3; €495 total (€350+€145); 3–9 months; may require Adaptation Placement
- SANC — issues mandatory CoGS; 6-month validity; apply after destination confirms reference number

**Recruiter landscape mapped:**
- **Recommended (with conditions):** MMA Healthcare Recruitment (founded 1998, SA office confirmed, NHS Employers Code compliant, employer-pays); Global Nurse Force (US-based, REC member, WHO Code compliant, zero-cost, no SA office); Medipath Healthcare Recruitment (SA-based 2012, Australia/NZ focus, fee structure unconfirmed)
- **Caution / verify before engaging:** Thymic Recruitment (CIPC unconfirmed, website inactive since 2022); SWA Nursing Recruitment (Nigeria-based not SA, Lorem ipsum testimonials); AHP International Nursing (redirects to ALOR Group — rebrand unconfirmed)
- **Definitively unverified:** Pulse Staffing SA — no SA-registered entity found after 4 rounds; research brief listed it as SA-based but CIPC search failed to confirm

**Key strategy documented:**
- NMC→AHPRA Strategy (UK-first shortcut): register NMC → accumulate 1,800 hrs NHS → qualify for AHPRA Pathway 1 (1–3 months, no AU exam); total ~15–21 months but eliminates AU exam costs
- Universal first step for all pathways: SANC CoGS — apply only after starting destination application (SANC direct-ships; 6-month validity)

**Open items:**
- SANC CoGS ZAR fee and processing time still unconfirmed (contact customerservice@sanc.co.za / 012 420 1000)
- NMC fee discrepancy: NHS Employers (£153 reg) vs RealNursingJourney (£140 app + £120 final) — verify before using in content
- AHPRA fees sourced from third parties (AUD 410 initial + AUD 193/yr) — ahpra.gov.au returned 403

---

## Pending
- Build `lib/pathway-content.ts` + `app/members/[token]/page.tsx` (R199 member product) — see CLAUDE.md
- `app/admin/page.tsx` — manual token generator
- `app/api/admin/generate-token/route.ts`
- `app/api/cv/upload/route.ts` + `components/CVSection.tsx`
- `app/privacy/page.tsx`
- Supabase wiring (schema in `docs/Work Abroad MVP Plan.md`)
