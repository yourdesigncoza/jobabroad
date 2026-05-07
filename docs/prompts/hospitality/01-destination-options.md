# Prompt: Hospitality — Destination Options

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-hospitality-01-destinations`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-hospitality-01-destinations

**Goal:** Map every realistic destination for South African hospitality workers (chefs, cooks, restaurant managers, hotel staff, baristas, waiting staff) as of 2025–2026 — covering UAE Employment Visa, UK Skilled Worker (post-22-July-2025 narrowing to senior chef and management only), Australia Skills in Demand 482 chef/cook routes, and Canada TFWP hospitality LMIA — and explicitly document routes that look open but are now closed for line-level workers (UK Skilled Worker for line cooks / kitchen porters / waiters / baristas after 22 July 2025) so readers can recognise scam pitches that still advertise these routes.

**Seed entities:**
- UAE Employment Visa — sponsored by trade-licence-holding UAE employer; issued via Ministry of Human Resources and Emiratisation (MOHRE) + ICP / GDRFA Dubai; no points test; SA passport holders eligible; standard 2-year contract; no PR pathway for hospitality workers
- UK Skilled Worker visa — Appendix Skilled Occupations Table 1 (RQF 6) only since 22 July 2025; chef SOC 5434 retained but only senior/head/sous chef and restaurant management roles meeting £41,700 general threshold (or £33,400 new-entrant); line cooks / waiters / baristas removed
- Australia Skills in Demand (Subclass 482) Core Skills stream — chef ANZSCO 351311, cook 351411 on CSOL; CSIT AUD $76,515 (2025–26 program year), rising to AUD $79,499 from 1 July 2026; VETASSESS skills assessment required
- Canada TFWP hospitality LMIA — chef NOC 62200, cook NOC 63200; LMIA-based employer sponsorship; CAD $1,000 LMIA fee (employer pays); chef/cook on multiple PNP occupation lists (BC, Alberta, Quebec)
- USA J-1 hospitality intern/trainee — flag as junior/student-only route, not for established hospitality professionals (covered in seasonal guide); document briefly so readers do not confuse with main hospitality routes

**Source constraints:** gov.uk/skilled-worker-visa, gov.uk/government/publications/skilled-worker-visa-going-rates-for-eligible-occupations, gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations, mohre.gov.ae, u.ae, gdrfa.ae, immi.homeaffairs.gov.au, immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-482, jobsandskills.gov.au (CSOL / occupation lists), vetassess.com.au, canada.ca/en/employment-social-development/services/foreign-workers/, noc.esdc.gc.ca, dha.gov.za, cathsseta.org.za

**Iterations:** 8

---

## Note schemas — apply to every note created

**DESTINATION note:**
```markdown
---
type: destination
country:
sa_diaspora_size:
sa_hospitality_demand_signal:
primary_visa_route: "[[visa_route_name]]"
secondary_visa_routes: []
roles_open_to_sa: [chef-senior | chef-line | cook | hotel-management | front-of-house | bar | spa-and-wellness]
sa_eligible: [yes | no | yes_skilled_only]
who_runs_recruitment: [employer | hotel-group | recruitment-agency | mixed]
pr_pathway: [none | possible_skilled_only | direct]
route_status: [open | restricted | closed | emerging]
last_signal_date:
evidence_strength: confirmed | alleged | rumoured
tags: [destination, hospitality, work-abroad, south-africa]
sources:
  -
---

# Country Name

2–4 sentences: which hospitality routes are realistic for SA workers, current demand level, honest assessment of which roles are achievable (entry-level vs senior).

## Demand Evidence
Quantified signals — UAE hotel-group recruitment volumes, UK SOC 5434 going-rate updates, Australia CSOL chef/cook status, Canada PNP draw frequency for hospitality NOCs.

## Who Is Actively Recruiting
Named hotel groups (Marriott, Hilton, Jumeirah, Emaar, Accor, Four Seasons), recruitment agencies (Hospitality Jobs Africa, etc.) with confirmed SA placements. If none specifically named, state "No SA-specific named recruiter confirmed in the public record".

## Realistic Assessment
Honest appraisal: is this route open for entry-level work or senior/management only? Distinguish UAE (open broadly) from UK (senior only post-22-July-2025) from Australia (skilled chef only via VETASSESS) from Canada (LMIA-driven).

## Connections
- [[Visa Route]] — accessed_via, source: [url]
- [[Hotel Group or Sponsor]] — placed_by, source: [url]

## Sources
- [Source title](url)
```

**RESTRICTED ROUTE note:** *(create one for every route that looks open but is now closed/narrowed for SA hospitality workers — critical anti-scam content)*
```markdown
---
type: restricted_route
name:
country:
short_name:
roles_now_closed: []
effective_date:
official_rule_url:
common_misrepresentation:
how_scammers_exploit:
evidence_strength: confirmed
tags: [restricted-route, scam-vector, hospitality, south-africa]
sources:
  -
---

# Restricted Route Name

Plain statement: which hospitality roles were removed from this route, when, and why. Cite the official rule with URL. State why this matters: recruiters still pitch these roles for routes that no longer accept them.

## What Changed — From Official Source
Quote (with URL) the exact rule change from the administering body. Cite line/page number from any Statement of Changes in Immigration Rules document.

## How This Becomes a Scam
What the recruiter pitch looks like (e.g. "UK chef visa £30,000 salary"); how to verify the route is closed (link to current eligible occupation list); reporting channel.

## Connections
- [[UK Visas and Immigration]] or equivalent — issued_rule_change, source: [url]

## Sources
- [Statement of Changes URL](url)
```

**EDGE metadata:**
- `relationship_type`: accessed_via | placed_by | regulated_by | excludes_role | issued_warning_about | replaced_by | available_in | competes_with
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY (if route closed)
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **UK 22 July 2025 rule change is critical** — the UK Skilled Worker visa raised the skill level to RQF 6 (degree level) and removed many occupations from eligibility, including chef line roles, kitchen porter, waiter, barista, hotel receptionist. Chef SOC 5434 is **retained but only at senior level** meeting the £41,700 general threshold (or £33,400 new-entrant). Document this change explicitly with the Statement of Changes citation (assets.publishing.service.gov.uk HC 997). Any recruiter advertising UK chef placement at line-level salary is selling a closed route
- **UAE worker-fee prohibition** — MOHRE Resolution No. 47 of 2022 prohibits charging hospitality workers any recruitment, work-permit, visa, or transportation fees. Employer pays MOHRE work-permit fee, Employment Visa fee, Emirates ID fee, medical test fee. Worker pays **nothing** for the visa itself. Any "registration fee" / "visa processing fee" demand is a federal violation
- **UAE has no PR pathway for hospitality workers** — UAE Golden Visa eligibility is restricted to investors, exceptional talent, certain senior doctors/engineers/scientists. Standard hospitality workers (chefs, line cooks, hotel staff) are **not eligible** for Golden Visa. State this explicitly so readers do not chase a non-existent route
- **Australia CSIT 2025–26 = AUD $76,515; from 1 July 2026 = AUD $79,499** (annual indexation under Regulation 5.42A). Date-stamp the figure and tell readers to re-verify the current threshold against immi.homeaffairs.gov.au before lodging. CSIT applies to 482 Core Skills nominations
- **Canada chef NOC 62200 vs cook NOC 63200** — chef ("responsible for the kitchen and overall food production") and cook ("specific roles per recipe") are distinct NOCs with different PNP eligibility and salary going-rates. Document both; do not collapse to "chef/cook"
- **VETASSESS skills assessment cost (Australia)** ~AUD $1,096 for offshore Full Skills Assessment (Oct 2025 fee schedule). Trade-style assessments are higher and multi-stage. Flag for re-verification at vault-build time
- **USA J-1 hospitality intern/trainee** — eligible only for SA students or recent culinary graduates; not for established hospitality professionals. Document briefly with a "see seasonal guide" pointer, do not develop deeply here
- **Cruise ship hospitality work is not a visa-scheme route** — cruise lines are flagged-vessel maritime employers. If vault research surfaces "cruise hospitality" content, classify as adjacent (not primary) and warn that maritime fishing-vessel scam patterns also apply
- **No SA-side licensed scheme operator structure** — unlike UK Seasonal Worker farming, hospitality has no SA-side Defra-style operator. SA hospitality workers apply directly to hotel groups, individual employers, or via SA-based recruitment agencies (Hospitality Jobs Africa, etc.) — name these where confirmed by primary or secondary sources
- All salary thresholds, occupation-list statuses, and visa fees must be date-stamped — annual review cycles
- Folder structure: `Destinations/`, `Restricted Routes/`, `Hotel Groups/`, `Recruitment Agencies/`
