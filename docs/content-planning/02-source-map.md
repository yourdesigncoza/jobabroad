# Source Map — canonical official sources

Every route page must cite the **official government / regulator** source for its visa
and registration claims. Recruiter/agency pages are only ever linked as "verify before
contacting", never as the basis of a factual claim (project evidence policy).

`high` = canonical domain + page confirmed from known official sources.
`verify` = canonical domain correct, exact page path must be confirmed during research.

## A. Destination — work-authorisation / visa source (per country)

| Country | Primary official source | Conf. |
|---|---|---|
| United Kingdom — skilled | https://www.gov.uk/skilled-worker-visa | high |
| United Kingdom — health/care | https://www.gov.uk/health-care-worker-visa | high |
| United Kingdom — seasonal/farm | https://www.gov.uk/seasonal-worker-visa | high |
| Ireland | https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/ | high |
| Australia | https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482 | high |
| Canada | https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html | high |
| New Zealand | https://www.immigration.govt.nz/new-zealand-visas | high |
| Germany | https://www.make-it-in-germany.com/en/visa-residence/types | high |
| United States — au pair / exchange | https://j1visa.state.gov/programs/au-pair | high |
| United States — summer work travel | https://j1visa.state.gov/programs/summer-work-travel | high |
| United States — agricultural (H-2A) / seasonal (H-2B) | https://travel.state.gov/content/travel/en/us-visas/employment/temporary-worker-visas.html | high |
| UAE | https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector | high |
| South Korea — public-school teaching (E-2) | https://www.epik.go.kr | high |
| Japan — teaching (JET) | https://jetprogramme.org/en/ | high |
| Netherlands | https://ind.nl/en/work | verify |
| Netherlands — au pair | https://ind.nl/en/residence-permits/work/au-pair | verify |
| France | https://france-visas.gouv.fr/en/web/france-visas/working | verify |
| Saudi Arabia — work visa | https://www.my.gov.sa/wps/portal/snp/eParticipation/visas | verify |
| Qatar | https://www.adlsa.gov.qa/en/Pages/default.aspx | verify |
| China — work (Z visa) | https://www.visaforchina.cn | verify |
| Vietnam — work permit | https://immigration.gov.vn | verify |

## B. Profession regulators (needed for healthcare / trades / teaching / engineering)

A route is not credible without the *registration* source, not just the visa source.
Confirm the current one during page research; common ones:

| Profession + country | Regulator / recognition body |
|---|---|
| Nursing — UK | NMC — https://www.nmc.org.uk |
| Nursing — Ireland | NMBI — https://www.nmbi.ie |
| Nursing — Australia | AHPRA / NMBA — https://www.ahpra.gov.au |
| Nursing — New Zealand | Nursing Council of NZ — https://www.nursingcouncil.org.nz |
| Nursing — Canada | NNAS (assessment) — https://www.nnas.ca |
| Nursing — Saudi Arabia | SCFHS — https://scfhs.org.sa/en |
| Teaching — UK (QTS) | https://www.gov.uk/guidance/qualified-teacher-status-qts |
| Trades — Australia | Trades Recognition Australia — https://www.tradesrecognitionaustralia.gov.au |
| Engineering — Australia | Engineers Australia — https://www.engineersaustralia.org.au |
| Engineering — SA recognition baseline | ECSA — https://www.ecsa.co.za |

## C. South-Africa-side document sources (reusable across all routes)

| Document | Official source |
|---|---|
| Qualification evaluation | SAQA — https://www.saqa.org.za |
| Apostille / authentication | DIRCO — https://www.dirco.gov.za |
| Police clearance certificate | SAPS — https://www.saps.gov.za/services/applying_clearence_certificate.php |

These three power a reusable **document-guide support layer** — each gets its own page
(`/guides/police-clearance`, `/guides/saqa-evaluation`, `/guides/apostille-dirco`) that
every route page links to, instead of repeating the explanation 120 times (DRY).

## Maintenance

Official fees and rules change. Re-verify the `high` sources quarterly and any `verify`
source at the moment its page is written. Record the check date in the page's
`last_verified` frontmatter and the visible "last verified" line.
