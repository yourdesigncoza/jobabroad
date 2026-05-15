# Prompt: Accounting — Visa Routes

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-accounting-04-visa-routes`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-accounting-04-visa-routes

**Goal:** Build a current, source-verified reference of every visa route available to South African accountants and finance professionals for the UK, Australia, Canada, Ireland, and New Zealand — covering eligibility, salary thresholds (with date stamps for 22 July 2025 UK reforms), SOC/NOC/ANZSCO occupation codes, processing times, PR pathways, and recent policy changes that materially affect SA applicants in 2025–2026.

**Seed entities:**
- UK Skilled Worker Visa under SOC 2020 — SOC 2421 (Chartered and Certified Accountants) — general threshold £41,700 from 22 July 2025, but **occupation going rate for SOC 2421 = £49,200 from 22 July 2025**; salary must be the higher of these two; SOC 2423 (Taxation experts) where role is tax-specialist
- Australia Skills in Demand Visa subclass 482 — Accountant (General), Management Accountant, Taxation Accountant, External Auditor on **Core Skills Occupation List (CSOL)** (NOT "Skills Priority List" — that is Jobs and Skills Australia's labour-market list, separate from visa eligibility)
- Canada Express Entry (FSWP / CEC) — NOC 11100 Financial auditors and accountants (TEER 1), NOC 10010 Financial managers (TEER 0); ECA from any IRCC-designated organisation (WES is one option among several)
- Ireland Critical Skills Employment Permit (CSEP) — €40,904 listed / €68,911 any-occupation; **DETE Eligible Occupations List for accountants page** — verify exact SOC 2010 codes (e.g. 2421 listed-specialist accounting/tax, 2424 specialist finance/risk/credit/fraud analytics) on enterprise.gov.ie
- New Zealand Accredited Employer Work Visa (AEWV) — Accountant on Green List Tier 2

**Source constraints:** gov.uk/skilled-worker-visa, gov.uk/government/publications/skilled-worker-visa-going-rates-for-eligible-occupations, gov.uk Immigration Rules Appendix Skilled Occupations, Appendix Skilled Worker, Appendix English Language, assets.publishing.service.gov.uk (Statement of Changes HC 997 — July 2025), homeaffairs.gov.au, immi.homeaffairs.gov.au (visa 482, 186), immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list (CSOL legislative instrument), abs.gov.au (ANZSCO codes for accountants), cpaaustralia.com.au, charteredaccountantsanz.com, publicaccountants.org.au (Australian assessing authorities for migration skills assessment), canada.ca/en/immigration-refugees-citizenship.html (Express Entry, NOC 11100/10010), canada.ca/en/immigration-refugees-citizenship/services/come-canada-tools/credential-foreign.html (IRCC-designated ECA organisations), esdc.gc.ca (NOC pages), enterprise.gov.ie (CSEP Critical Skills Occupations List), enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/critical-skills-employment-permit/, enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/employment-permit-eligibility/accountants/, immigration.govt.nz (AEWV, Green List, Appendix 13 instructions), frc.org.uk (Recognised Supervisory Bodies framework for UK statutory audit context)

**Iterations:** 10

---

## Note schemas

**VISA ROUTE note:**
```markdown
---
type: visa_route
name:
short_name:
country:
route_status: [open | restricted | closed | emerging]
visa_subclass_or_code:
occupation_codes_eligible: []          # SOC 2421/2422, ANZSCO 221111/221112/221113/221213, NOC 11100/10010
replaced_by:
replaced_what:
rqf_or_qualification_level:
language_requirement:
minimum_salary_threshold:
minimum_salary_threshold_currency:
minimum_salary_effective_date:
employer_sponsorship_required: [yes | no]
health_surcharge_applies: [yes | no | waived]
processing_time_standard:
processing_time_priority:
initial_visa_duration:
pr_pathway:
pr_timeline:
last_policy_change:
last_policy_change_date:
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, accounting, work-abroad, [country_code]]
sources:
  -
---

# Visa Route Name

Plain-language summary: what this visa is, who it is for, current status as of [month-year].

## Eligibility for SA Accountants
Specific requirements applying to SA-qualified accountants — does SAICA MRA satisfy the qualification check? Is skills assessment required separately? Salary threshold for accounting SOC/NOC/ANZSCO codes. Language-test requirement (or exemption rationale for SA English-medium training).

## Current Status & Recent Changes
Any changes in the last 12 months. UK 22 July 2025 reforms (£41,700, RQF 6, going rates from 2024 ASHE). Ireland Employment Permits Act 2024 (Sept 2024) changes. Canada NOC 2021 transitions.

## PR Pathway
How and when an accountant on this visa can apply for PR / ILR / Stamp 4.

## Employer's Role
Sponsor licence, Certificate of Sponsorship (UK), Standard Business Sponsorship (AU), LMIA exemption status (CA), Employment Permits Online (IE), Employer Accreditation (NZ).

## Connections
- [[Destination]] — available_in, source: [url]
- [[Professional Body]] — assessed_by, source: [url]
- [[Occupation Code]] — eligible_under, source: [url]

## Sources
- [Source title](url)
```

**POLICY CHANGE note:**
```markdown
---
type: policy_change
name:
visa_route_affected: "[[visa_route_name]]"
effective_date:
what_changed:
impact_on_sa_accountants:
source_document:
evidence_strength: confirmed | alleged | rumoured
tags: [policy-change, visa, accounting, work-abroad, [country_code]]
sources:
  -
---

# Policy Change: [Short Description]

What changed, when, and what it means for an SA accountant applying now.

## Before vs After
| | Before | After |
|---|---|---|
| Qualification level | | |
| Salary threshold | | |
| Going rate basis | | |
| Eligibility | | |

## Connections
- [[Visa Route]] — affects, source: [url]

## Sources
- [Source title](url)
```

**OCCUPATION CODE note:**
```markdown
---
type: occupation_code
code:
classification: [SOC 2020 | ANZSCO | NOC 2021]
country:
official_title:
related_titles_recognised: []
rqf_or_skill_level:
going_rate_or_threshold:
going_rate_currency:
going_rate_effective_date:
official_url:
evidence_strength: confirmed | alleged | rumoured
tags: [occupation-code, accounting, [country_code]]
sources:
  -
---

# Code — Title

What this code covers, what job titles map to it, whether SA accounting designations satisfy it.

## Connections
- [[Visa Route]] — eligible_under, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: available_in | requires_registration_with | replaced_by | replaced | affects | pr_leads_to | assessed_by | eligible_under | excluded_under
- `description`: short label
- `date_range`: YYYY–present
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — only `confirmed` when the destination government's own page or statutory instrument confirms the threshold/process. Search snippets and aggregator articles are NOT primary sources.
- **UK 22 July 2025 reforms MUST be flagged explicitly on every UK route**: general threshold £41,700, going rates revised from 2024 ASHE, RQF 6 enforced. **Salary paid must be the higher of £41,700 OR the occupation going rate** — for SOC 2421 the going rate is £49,200, so the operative floor is £49,200, not £41,700. Show "Before / After 22 July 2025" comparison.
- **SOC code precision (SOC 2020)**: Use SOC 2421 for Chartered and Certified Accountants; SOC 2423 for Taxation experts; **SOC 3533 (Financial and Accounting Technicians)** is the SOC 2020 code (NOT 3537 — that is SOC 2010) — likely no longer qualifies post-22 July 2025 RQF 6 rule except via transitional/Option K paths. Confirm via gov.uk Statement of Changes HC 997.
- **SA passport English requirements**: SA is NOT on the UKVI English-exempt list; English-medium qualification evidence may suffice for UK. **Australia does NOT include South Africa in the passport-based English exemption** for subclass 482 (competent English typically still required). **New Zealand AEWV / skilled-residence does NOT exempt SA-passport holders from English requirements** — flag explicitly. Do not present any of these as automatic exemptions.
- **CA ANZ RMA grants designation, not a migration skills assessment**: CSOL is occupation-eligibility, not a skills assessment. A separate migration skills assessment via a designated assessing authority (CPA Australia, CA ANZ, or IPA Australia) is required for 482/186 nomination where the visa stream requires one. Flag the distinction.
- **CPA Canada RMA does NOT replace ECA for Express Entry** — Express Entry CRS scoring requires an ECA from an IRCC-designated organisation (WES is ONE option; others include ICAS-Canada, CES, ICES, IQAS) regardless of CPA membership. Flag this.
- **All salary thresholds must be dated** — annual review cycles in UK (April / July reviews), AU (TSMIT July), IE (regulatory instruments), NZ (median-wage indexed), CA (NOC-tied LMIA wage rates).
- **Tax-agent practice rights are separate** from CA designation — Australia TPB and NZ Inland Revenue have independent registration regimes for tax-agent roles. Flag if a route targets taxation roles.
- **Distinguish visa route from designation route**: MRA gets you the designation; visa is a separate Home Office / DHA / IRCC / DETE / INZ application. Sequence: designation first or in parallel with visa, never assume one grants the other.
- Flag any closed/restricted route explicitly as `[CLOSED — do not recommend]` or `[RESTRICTED — see notes]`.
- Folder structure: `Visa Routes/`, `Policy Changes/`, `Occupation Codes/`
