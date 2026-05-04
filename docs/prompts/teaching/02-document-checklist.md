# Prompt: Teaching — Document Checklist

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-teaching-02-documents`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-teaching-02-documents

**Goal:** Build a complete, sequenced, source-verified document checklist for a South African teacher applying to work in the UK, Australia, and New Zealand — covering every document from SA-side preparation through to destination qualification recognition and visa application, with processing times, costs, and known traps.

**Seed entities:**
- SACE Letter of Good Standing (South African Council for Educators — required for UK QTS and overseas recognition)
- DfE Apply for QTS in England service (UK Department for Education — free professional recognition service; eligibility expanded to SA teachers from 7 August 2025; requires SACE Letter of Good Standing)
- AITSL skills assessment (Australian Institute for Teaching and School Leadership — required for teacher migration visa in Australia)
- Statement of Comparability (Ecctis — UK NARIC equivalent; may be required alongside QTS application to compare SA qualifications against English standards)
- UK Certificate of Sponsorship (issued by Licensed Sponsor school — required before Skilled Worker Visa application)

**Source constraints:** sace.org.za, saps.gov.za, dirco.gov.za, gov.uk/guidance/qualified-teacher-status-qts, gov.uk/government/publications/overseas-trained-teachers-apply-for-qualified-teacher-status-in-england/overseas-trained-teachers-apply-for-qualified-teacher-status-in-england, apply-for-qts-in-england.education.gov.uk, ecctis.com, gov.uk/skilled-worker-visa, gov.uk/register-of-licensed-sponsors, aitsl.edu.au/migrate-to-australia/apply-for-a-skills-assessment, vit.edu.au, nesa.nsw.edu.au, qct.edu.au, homeaffairs.gov.au, immigration.govt.nz, teachingcouncil.nz, nzqa.govt.nz

**Iterations:** 6

---

## Note schemas

**DOCUMENT note:**
```markdown
---
type: document
name:
aliases: []
stage: [sa_preparation | sa_submission | destination_recognition | visa_application]
issued_by: "[[issuing_body]]"
submitted_to: "[[receiving_body]]"
required_for_destinations: []
processing_time_official:
processing_time_reported:
cost_zar:
cost_destination_currency:
validity_period:
pre_conditions: []
direct_shipping_required: [yes — body sends direct | no — issued to teacher | not_applicable]
apostille_required: [yes | no | destination_dependent]
evidence_strength: confirmed | alleged | rumoured
tags: [document, teaching, work-abroad, checklist]
sources:
  -
---

# Document Name

What this document is, what it proves, and at what stage of the process it is needed.

## How to Obtain
Step-by-step from the official source.

## Pre-conditions
Any conditions that must be met before this document can be obtained (e.g. SACE Letter of Good Standing requires ≥1 year teaching in SA after qualifying; outstanding SACE annual fees block issuance).

## Known Delays & Traps
Real-world processing issues, sequencing dependencies, or validity time limits (e.g. SACE Letter of Good Standing must be dated within 3 months of QTS application).

## Connections
- [[Issuing Body]] — issued_by, source: [url]
- [[Receiving Body]] — submitted_to, source: [url]

## Sources
- [Source title](url)
```

**EXAM note:**
```markdown
---
type: exam
name:
short_name:
required_by: []
accepted_versions: []
minimum_score:
valid_for_years:
test_centres_sa: []
booking_lead_time:
cost_zar:
cost_local_currency:
prep_resources: []
evidence_strength: confirmed | alleged | rumoured
tags: [exam, teaching, language-test, registration]
sources:
  -
---

# Exam Name

What this exam tests, why it is required, and which destination requires it.

## Minimum Score for Teacher Registration
Score requirements per destination (AITSL for Australia — IELTS Academic only; note which other tests are NOT accepted).

## SA Test Centres
Where SA teachers can sit this exam.

## Connections
- [[Destination Regulator]] — required_by, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: issued_by | submitted_to | required_for | precedes | follows | unlocks | requires_before
- `description`: short label
- `date_range`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- Date-stamp all costs, thresholds, and occupation-list statuses — these change annually
- Flag any closed or suspended routes explicitly as [CLOSED - do not recommend]
- Never present agent estimates as confirmed figures; source must be a government or regulator URL
- If a source is older than 12 months, flag evidence_strength as alleged unless confirmed by a recent primary source
- **SACE Letter of Good Standing pre-condition:** SACE will not issue if the teacher has not taught in SA for ≥1 year. Outstanding SACE annual fees block issuance. Issued within 30 days. Must be recently dated (verify currency requirement with current DfE/SACE guidance). SA teachers already working in a valid teaching role in England may still apply for QTS but must meet all professional-status documentation requirements — confirm current DfE guidance on alternative documentation
- **AITSL English language requirement:** Only IELTS Academic is accepted — NOT IELTS General, PTE, TOEFL, or OET. SA teachers must sit IELTS Academic even as native English speakers unless they qualify via the study option. Research and confirm current AITSL English requirement
- **QTS free (Apply for QTS in England):** The DfE professional recognition service has no application fee. August 2025 expanded eligibility to SA teachers — it did not introduce free applications. Any source citing a QTS application fee for the professional-recognition route is outdated; flag accordingly. Note: assessment-only QTS and teacher-training programmes (iQTS etc.) do charge provider fees — these are separate routes
- Sequence matters — note which documents must be obtained before others can be started (e.g. SACE Letter of Good Standing → QTS application → job offer → Certificate of Sponsorship → Skilled Worker Visa)
- Folder structure: `Documents/`, `Exams/`

<!--
## Canvas export (on-demand)
Generate canvas only when user explicitly requests "generate canvas".
-->
