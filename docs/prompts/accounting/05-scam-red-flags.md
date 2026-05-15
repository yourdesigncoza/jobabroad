# Prompt: Accounting — Scam Red Flags

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-accounting-05-scams`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-accounting-05-scams

**Goal:** Catalogue the scam patterns specifically targeting South African accountants and finance professionals seeking overseas work — including fake SAICA-MRA "fast-track" agencies, fake London / Dublin / Toronto recruiter profiles, AQ (UK Audit Qualification) misrepresentation, fake CPA Canada / CPA Provincial registration agents, ACCA/CIMA "upgrade" services targeting members who don't need MRAs, and the universal upfront-fee and identity-document scams that hit all profession verticals. Pair every pattern with a concrete verification step the buyer can take.

**Seed entities (specific named bodies / programmes anchoring scam patterns):**
- SAICA reciprocity / RMA / Reciprocity and Affiliations page (saica.org.za) — anchors "fake SAICA MRA fast-track" scams
- ICAEW Audit Qualification + FRC Recognised Supervisory Bodies framework (icaew.com + frc.org.uk) — anchors "SAICA gives UK audit signing rights" misrepresentation
- CPA provincial bodies — CPA Ontario, CPA BC, CPA Alberta, CPA Quebec (cpaontario.ca, cpabc.ca, cpaalberta.ca, cpaquebec.ca) — anchors fake provincial-registration intermediaries
- NASBA-IQAB (iqab.nasba.org + nasba.org/international/mra) — anchors fake US IQEX intermediaries
- College of Immigration and Citizenship Consultants (college-ic.ca, formerly ICCRC) — anchors fake Canadian immigration adviser scams

**Source constraints:** gov.uk/find-licensed-sponsors-worker-visa (UK Licensed Sponsor Register CSV), homeaffairs.gov.au (AU sponsor / nomination guidance and labour-agreement lists — Australia does NOT publish a general public standard-business-sponsor register; verification is via ABR + nomination evidence), abr.business.gov.au (Australian Business Register), enterprise.gov.ie (DETE employment permit statistics + EP status enquiry — Ireland's "Trusted Partner" status is NOT a public employer-verification anchor; use permit statistics / company listings + CRO), cro.ie (Ireland Companies Registration Office), immigration.govt.nz/employ-migrants/accredited-employer (NZ Accredited Employer list), find-and-update.company-information.service.gov.uk (UK Companies House), search.cipc.co.za (SA CIPC company search), saica.org.za/news (SAICA member alerts and scam warnings), saica.org.za/members/member-networks/reciprocity-and-affiliations/, icaew.com (ICAEW fraud-alerts + member/firm/audit-register verification), icas.com (ICAS verification), charteredaccountantsanz.com (CA ANZ news / alerts), cpacanada.ca + provincial CPA registers (cpaontario.ca/Members-Public/Public-Search, etc.), charteredaccountants.ie (CAI member directory; note CPA Ireland amalgamated into CAI 1 Sept 2024), accaglobal.com (ACCA member/firm directory — UK RSB context), frc.org.uk (Recognised Supervisory Bodies framework — to defeat AQ-misrepresentation scams), irba.co.za (SA audit register — to defeat SA-side audit-designation confusion), portal.immigrationadviceauthority.gov.uk (Immigration Advice Authority — formerly OISC), gov.uk (IAA Adviser Finder/Register), mara.gov.au (Migration Agents Registration Authority — Australia), college-ic.ca (College of Immigration and Citizenship Consultants — Canada; formerly ICCRC), canada.ca (IRCC immigration fraud/scams and authorised representatives pages), nasba.org/cpaverify, action-fraud-news.uk (UK fraud reporting), saps.gov.za (SAPS), commercial-crime-saps.gov.za

**Iterations:** 6

---

## Note schemas

**SCAM PATTERN note:**
```markdown
---
type: scam_pattern
name:
short_name:
target_audience: [ca_sa | saipa | cima | acca | all_sa_accountants | recent_graduates | senior_finance_professionals]
mechanism:
typical_loss_zar_range:
red_flags: []
verification_steps: []
official_complaint_route:
evidence_strength: confirmed | alleged | rumoured
tags: [scam, accounting, work-abroad]
sources:
  -
---

# Scam Pattern Name

How the scam works, who it targets, what's actually being stolen (money, time, identity, or all three).

## Red Flags
Specific behaviours the buyer should recognise. Concrete, not generic.

## How to Verify Legitimacy
Step-by-step verification using public registers and primary sources:
- UK: cross-check sponsor against gov.uk Licensed Sponsor Register (publicly downloadable CSV)
- AU: there is NO public "standard business sponsor register" — verify employer via ABR (abr.business.gov.au) + Home Affairs nomination guidance + labour-agreement lists where relevant
- IE: confirm via DETE employment permit statistics / company listings or the EP status enquiry where the applicant has reference details (Trusted Partner status is NOT a public employer-verification anchor); cross-check company against cro.ie
- CA: confirm employer LMIA / IRCC status via canada.ca; verify any immigration adviser at college-ic.ca (formerly ICCRC)
- UK immigration advisers: verify at portal.immigrationadviceauthority.gov.uk (Immigration Advice Authority — formerly OISC)
- SA: cross-check company against CIPC search.cipc.co.za

## Where to Report
Specific complaint routes — SAICA (if member-targeted), local police, action-fraud-news.uk (UK), Action Fraud, CIPC for SA company misrepresentation.

## Connections
- [[Verification Source]] — verified_against, source: [url]
- [[Real Body]] — impersonates, source: [url]

## Sources
- [Source title](url)
```

**VERIFICATION SOURCE note:**
```markdown
---
type: verification_source
name:
country:
covers: []                # sponsors | accountants | immigration_advisers | companies
search_url:
csv_or_api_available: [yes | no]
update_frequency:
evidence_strength: confirmed | alleged | rumoured
tags: [verification, accounting, work-abroad, [country_code]]
sources:
  -
---

# Verification Source Name

What it covers, how to search it, how recent the data is.

## How to Use
Concrete instructions for an SA accountant verifying a recruiter, employer, or body.

## Connections
- [[Destination]] — verifies_for, source: [url]

## Sources
- [Source title](url)
```

**RED FLAG note:**
```markdown
---
type: red_flag
name:
applies_to: []           # recruiter_communication | payment_request | document_request | website_pattern
severity: [warning | high | critical]
linked_scam_patterns: []
evidence_strength: confirmed | alleged | rumoured
tags: [red-flag, scam, accounting]
sources:
  -
---

# Red Flag Name

Single concrete behaviour that should stop the buyer cold.

## Why It's a Red Flag
What legitimate processes do instead (e.g. legitimate sponsors don't ask for ID/passport before contract).

## Connections
- [[Scam Pattern]] — indicates, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: impersonates | verified_against | verifies_for | indicates | reported_to | linked_to_pattern
- `description`: short label
- `date_range`: YYYY-MM
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — never present alleged scam actors as criminally charged unless a court record or SAPS/Action Fraud reference is cited.
- **Neutral, non-defamatory language**: name patterns and behaviours, not individuals or specific company names unless a primary source (e.g. court case, SAICA alert, gov.uk warning) names them.
- **Every red flag MUST pair with a verification step** the buyer can actually run — never write a red flag without the "how to verify" counterpart.
- **AQ-misrepresentation pattern is critical** because the audit-qualification ceiling is a recurring SAICA misconception — defeat the lie with a frc.org.uk citation.
- **CPA provincial complexity is an attack vector**: scams exploit the difference between CPA Canada membership and provincial registration. Document the legitimate two-step path clearly.
- **CIMA / ACCA holders do NOT need MRA services** — flag the "MRA upgrade for CIMA/ACCA holders" pattern as scam-by-creating-fake-need.
- **Universal scam patterns** (upfront fees, ID requests before contract, WhatsApp-only operators, Facebook-Group-only operators, urgency tactics) MUST cross-reference shared vault `wa-shared-scams` when that vault exists.
- **Legitimate body fees still apply** — never say "all upfront fees are scams". SAICA-reciprocity partner bodies (ICAEW, ICAS, CA ANZ, CPA Canada, Chartered Accountants Ireland / CAI — note CPA Ireland amalgamated into CAI effective 1 Sept 2024, NASBA-IQAB/IQEX) DO charge legitimate application fees on their own websites. Distinguish "fee paid to body via body's website" from "fee paid to intermediary".
- Do not name a specific suspected scam operator unless a primary source (court ruling, SAICA member alert, official fraud-alert) names them publicly.
- Folder structure: `Scam Patterns/`, `Verification Sources/`, `Red Flags/`
