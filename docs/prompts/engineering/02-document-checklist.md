# Prompt: Engineering — Document Checklist

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-engineering-02-documents`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-engineering-02-documents

**Goal:** Build a complete, sequenced, source-verified document checklist for a South African engineer applying to work in Australia, Ireland, the UK, New Zealand, or Canada — covering every document from SA-side preparation through to destination skills-assessment, professional-body, and visa submission, with processing times, costs, and known lead-time traps.

**Seed entities:**
- ECSA confirmation of registration / academic accreditation letter (Engineering Council of South Africa)
- Engineers Australia Migration Skills Assessment — Accord-pathway documents and the Competency Demonstration Report (CDR)
- WES Educational Credential Assessment (Canada ECA for engineering degrees)
- SAPS Police Clearance Certificate + DIRCO apostille / authentication
- IELTS Academic / PTE Academic (English language test for engineering migration)

**Source constraints:** ecsa.co.za (registration and accreditation documents, accredited programme lists), ieagreements.org (IEA qualification checker — Washington / Sydney / Dublin Accord status by programme and year), engineersaustralia.org.au (migration skills assessment document checklist), vetassess.com.au and tradesrecognitionaustralia.gov.au (assessing authorities for non-EA engineering occupations), wes.org (Canada ECA requirements), engineerscanada.ca and provincial regulators e.g. PEO / EGBC / APEGA (Canada engineering licensure documents), ecctis.com (UK ENIC qualification comparison), saps.gov.za (police clearance certificate), dirco.gov.za (apostille and document authentication), ielts.org, pearsonpte.com, immi.homeaffairs.gov.au (Subclass 482 document requirements), enterprise.gov.ie and irishimmigration.ie (employment permit and Long Stay 'D' visa document requirements), engineersireland.ie (Ireland engineering recognition), nzqa.govt.nz (NZ International Qualification Assessment) and engineeringnz.org (NZ engineering credential checks, CPEng / Chartered Membership), SA engineering migration agency guidance documents (flag as anecdotal for reported processing times)

**Iterations:** 6

---

## Note schemas — apply to every note created

**DOCUMENT note:**
```markdown
---
type: document
name:
aliases: []
stage: [sa_preparation | sa_submission | skills_assessment | destination_registration | visa_application]
issued_by: "[[issuing_body]]"
submitted_to: "[[receiving_body]]"
required_for_destinations: []
processing_time_official:
processing_time_reported:
cost_zar:
cost_destination_currency:
validity_period:
apostille_required: [yes | no | destination_dependent]
prerequisite_documents: []
evidence_strength: confirmed | alleged | rumoured
tags: [document, engineering, work-abroad, checklist]
sources:
  -
---

# Document Name

What this document is, what it proves, and at what stage of the process it is needed.

## How to Obtain
Step-by-step from the official source.

## Known Delays & Traps
Real-world processing issues, lead-time traps, and sequencing dependencies (e.g. apostille can only follow the issued original).

## Connections
- [[Issuing Body]] — issued_by, source: [url]
- [[Receiving Body]] — submitted_to, source: [url]
- [[Prerequisite Document]] — precedes, source: [url]

## Sources
- [Source title](url)
```

**ASSESSMENT note** (skills assessments and language tests):
```markdown
---
type: assessment
name:
short_name:
assessment_type: [skills_assessment | language_test | qualification_recognition]
required_by: []
pathway_variant: [accord | cdr | eca | iqa | not_applicable]
minimum_score_or_outcome:
validity_period:
test_centres_or_portal_sa: []
booking_or_submission_lead_time:
cost_zar:
cost_destination_currency:
evidence_strength: confirmed | alleged | rumoured
tags: [assessment, engineering, work-abroad]
sources:
  -
---

# Assessment Name

What this assessment is, why it is required, and who requires it.

## Requirement per Destination
What each destination authority requires (Engineers Australia, WES, Engineering New Zealand, UK sponsor, Ireland DETE).

## Pathway Variants
For skills assessments: distinguish the Accord pathway (lighter, fewer documents, no CDR) from the CDR pathway. Note which ECSA-accredited degrees qualify for which.

## Documents Required / Prep Resources
What the applicant must submit, or official prep resources for language tests.

## Connections
- [[Skills Assessment Body or Regulator]] — required_by, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata (record on every direct verifiable connection):**
- `relationship_type`: issued_by | submitted_to | required_for | precedes | follows | apostilled_via | required_by
- `description`: short label
- `date_range`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules for vault-builder

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — never present agent estimates as fact
- Every note and every connection must cite at least one source URL
- Sequence matters — note explicitly which documents must be obtained before others can be started (e.g. degree certificate → apostille; transcripts → skills assessment)
- Always distinguish official processing time from reported real-world time
- Date-stamp all costs and processing times — these change
- **Accord vs CDR document load:** the Engineers Australia Accord pathway requires substantially fewer documents than the CDR pathway and needs no Competency Demonstration Report. Many SA engineering qualifications qualify for the Accord pathway — do not present the CDR as the default for SA engineers. But Accord eligibility is NOT automatic for any "ECSA-accredited degree": it depends on the specific programme being accredited under the relevant Accord, in the correct qualification category, and graduated within the accreditation period (South Africa's Washington Accord signatory date is 1999). Instruct the reader to verify their exact programme and graduation year against the IEA qualification checker / ECSA accredited-programme list before assuming they avoid the CDR.
- **Confirm the correct assessing authority.** Not all engineering occupations are assessed by Engineers Australia — some (e.g. Civil Engineering Draftsperson, certain technician roles) are assessed by VETASSESS or Trades Recognition Australia. Flag that the engineer must confirm the correct authority for their exact ANZSCO occupation before paying.
- **EA outcome letter validity:** if no validity date is printed, the Australian Department of Home Affairs treats a skills assessment as valid for 3 years from issue — note this.
- **Apostille lead time:** the DIRCO apostille / authentication step can only follow the issued original document and has its own queue — flag it as a critical lead-time trap.
- For engineers, the **migration-stage qualification recognition** (the skills assessment / ECA that the visa needs) is carried primarily by the ECSA accreditation of the degree via the Accords, not by personal Pr Eng registration — note where a destination assessor specifically requests an ECSA confirmation/good-standing letter. Distinguish this from **destination professional licensure** (P.Eng in Canada, CPEng in NZ/Australia, CEng in the UK), which is a separate, usually post-arrival process that can require a local regulator assessment, supervised experience, and ethics/law exams — do not conflate the two.
- Folder structure: `Documents/`, `Assessments/`

<!--
## Canvas export (on-demand only — do not generate unless explicitly requested)
-->
