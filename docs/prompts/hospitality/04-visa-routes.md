# Prompt: Hospitality — Visa Route Overview

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-hospitality-04-visa-routes`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-hospitality-04-visa-routes

**Goal:** Document every visa route currently available to South African hospitality workers — UAE Employment Visa, UK Skilled Worker (post-22-July-2025 narrowed scope), Australia Skills in Demand 482 Core Skills (chef/cook), Canada TFWP work permit (LMIA-based) — covering eligibility for SA passport holders, processing time, fees, employer obligations, dependant rules, and pathway to permanent residence (or absence). Explicitly document UK roles that were removed from eligibility on 22 July 2025 so readers understand which old recruiter pitches are now selling closed routes.

**Seed entities:**
- UAE Employment Visa — sponsored by trade-licence-holding UAE employer; processed by ICP (federal) or GDRFA Dubai; standard 2-year contract; renewable; no points test; no PR pathway for hospitality; spouse + children sponsorship via Family Visa (separate)
- UK Skilled Worker visa — Appendix Skilled Occupations Table 1 (RQF 6) only since 22 July 2025; chef SOC 5434 retained at senior level (£41,700+); ILR after 5 years; dependants restricted (RQF 3–5 cannot bring dependants on new applications post-22-July-2025)
- Australia Subclass 482 Core Skills — chef ANZSCO 351311, cook 351411 on CSOL; CSIT AUD $76,515 (rising AUD $79,499 from 1 July 2026); pathway to Subclass 186 ENS PR after 2 years; English IELTS 5.0 each band
- Canada TFWP LMIA-based work permit — chef NOC 62200, cook NOC 63200; employer obtains positive LMIA from ESDC before worker can apply; PR via PNP (BC, Alberta, Quebec) for chef; no PR via TFWP itself
- USA J-1 hospitality intern/trainee — flag briefly as student/trainee-only; not a route for established hospitality professionals

**Source constraints:** gov.uk/skilled-worker-visa, gov.uk/skilled-worker-visa/your-job, gov.uk/government/publications/skilled-worker-visa-going-rates-for-eligible-occupations, gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations, assets.publishing.service.gov.uk (Statement of Changes HC 997 22 July 2025), mohre.gov.ae, u.ae, gdrfa.ae, immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-482, immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/employer-nomination-scheme-186, vetassess.com.au, jobsandskills.gov.au, canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary.html, canada.ca/en/employment-social-development/services/foreign-workers/, ircc.canada.ca, noc.esdc.gc.ca

**Iterations:** 10

---

## Note schemas — apply to every note created

**VISA_ROUTE note:**
```markdown
---
type: visa_route
name:
country:
issuing_body:
sa_eligible: [yes | no | conditionally]
roles_covered_for_hospitality: []
sponsorship_required: yes | no
salary_threshold:
qualification_requirement:
language_requirement:
processing_time:
visa_validity:
extension_possible: [yes | no]
dependants_allowed: [yes | no | conditional]
pr_pathway: [none | direct | via_other_visa | possible_skilled_only]
fees_worker_pays:
fees_employer_pays:
official_signal_pages: []
last_verified_date:
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, hospitality, work-abroad, south-africa]
sources:
  -
---

# Visa Route Name

3–5 sentences: what this route is for, which hospitality roles qualify for SA workers, key SA-specific eligibility points.

## Eligibility for SA Passport Holders
Specific to SA — quota status, exclusion list status, English requirement, age limit, qualification recognition.

## Application Process
Step-by-step: employer-side (sponsorship licence, CoS / LMIA / nomination), then worker-side (visa application, biometrics, interview).

## Fees and Timing
Worker-paid breakdown vs employer-paid breakdown. Realistic processing range.

## Permanent Residence Pathway
State the route to PR (or absence). For UK: ILR after 5 years if salary maintained at threshold. For Australia: 482 → 186 ENS after 2 years. For Canada: PNP via PR-bearing province. For UAE: none (Golden Visa not for line hospitality).

## Connections
- [[Regulator / Issuing Body]] — issues, source: [url]
- [[Document]] — requires, source: [url]

## Sources
- [Official visa page URL](url)
```

**SKILLS_ASSESSMENT note:** *(VETASSESS chef/cook for Australia; ECCTIS for UK qualification verification; ECA for Canada PNP downstream)*
```markdown
---
type: skills_assessment
body:
country:
occupations_covered: []
fee:
processing_time:
validity:
language_required: [yes | no | conditional]
employment_history_required:
official_url:
last_verified_date:
evidence_strength: confirmed | alleged | rumoured
tags: [skills-assessment, hospitality, south-africa]
sources:
  -
---

# Skills Assessment Body Name

2–3 sentences: who issues, what occupations covered, why required for the destination route.

## Process
What documents to submit, how to validate qualifications and employment.

## Cost and Time
Standard vs priority. Date-stamp the fee.

## Connections
- [[Visa Route]] — required_for, source: [url]

## Sources
- [Official URL](url)
```

**EDGE metadata:**
- `relationship_type`: requires | sponsors | regulates | processes | replaced_by | leads_to | excludes_role
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **UK 22 July 2025 rule change is the most important fact in this section.** The Statement of Changes in Immigration Rules HC 997 raised the Skilled Worker skill level from RQF 3 to RQF 6 and removed many hospitality occupations from eligibility (line cook, kitchen porter, waiter, bartender, hotel receptionist, housekeeper). Chef SOC 5434 retained at senior level only. Cite the Statement of Changes URL (assets.publishing.service.gov.uk/media/68629c9b3464d9c0ad609d33/E03394848_-_HC_997_-_Immigration_Rules_Changes__Web_Accessible_.pdf or current location). Document the cutoff date and the dependant restriction for new RQF 3–5 applications
- **UK general salary threshold £41,700/year OR £33,400 new-entrant** — 22 July 2025 onwards. Hourly minimum £17.13/hour. Going-rate for SOC 5434 must be confirmed; if going-rate exceeds £41,700, the higher figure applies
- **UK ILR after 5 years** maintained at threshold; dependants for RQF 6 only (post-22-July-2025); existing RQF 3–5 visa holders with dependants can retain them
- **UAE Employment Visa structure** — Standard Work Permit issued by MOHRE; Employment Entry Visa issued by ICP / GDRFA; medical fitness test; Emirates ID; labour contract registration. Two-stage: entry visa (single-trip) → in-country visa stamping. Document the order
- **UAE Golden Visa is NOT for hospitality line workers** — Golden Visa categories are investors (AED 2M property OR AED 2M company), exceptional talent (sport, arts, sciences), specialised doctors and engineers, top students. State explicitly: chefs, cooks, hotel staff are not eligible
- **UAE family visa rules** — UAE Employment Visa holder can sponsor spouse + children if monthly salary meets the family sponsorship threshold (currently AED 4,000–10,000 depending on accommodation, verify against gdrfa.ae). Many entry-level hospitality workers do not meet this threshold
- **Australia 482 Core Skills CSIT AUD $76,515 (2025–26) → AUD $79,499 (1 July 2026)** — annual indexation under Regulation 5.42A. Date-stamp explicitly
- **Australia 482 → 186 ENS PR pathway** — 2 years on 482 + employer nominates for permanent ENS. ENS occupation list slightly different from 482; chef ANZSCO 351311 confirmed eligible for ENS Direct Entry stream
- **Canada chef NOC 62200 vs cook NOC 63200** — distinct NOCs. PNP eligibility for chef stronger than cook in BC, Alberta, Quebec. Document each PNP's hospitality stream openness
- **Canada LMIA fee CAD $1,000 employer-paid** — workers cannot be charged. Employer must advertise the position for ≥4 weeks before LMIA submission (current rule as of 2026, verify)
- **No PR via UAE for hospitality.** No PR via UK Skilled Worker for chefs unless 5-year ILR completed at threshold. PR via Australia 482→186 is realistic. PR via Canada chef PNP is realistic
- All thresholds, fees, and route statuses must be date-stamped
- Folder structure: `Visa Routes/`, `Skills Assessments/`, `Closed or Restricted Routes/`
