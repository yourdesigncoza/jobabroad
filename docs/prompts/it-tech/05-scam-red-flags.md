# Prompt: IT / Tech — Scam Red Flags

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-it-tech-05-scams`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-it-tech-05-scams

**Goal:** Build an ICT-specific reference of scam patterns targeting SA software developers, data engineers, cybersecurity specialists, and IT professionals seeking work abroad — covering how tech-recruitment scams differ from generic work-abroad fraud, specific red flags in remote-then-relocate offers, fake Big Tech interview invitations, Opportunity Card "fast-track" agents, Dubai crypto-IT job fronts, and how to verify a legitimate Irish / UK / German / Canadian / Australian tech employer or recruiter.

**Seed entities:**
- Fake Microsoft / Google / Amazon recruiter (WhatsApp / LinkedIn — "remote-then-relocate" pretext)
- UK Register of Licensed Sponsors (legitimate verification tool — filter by IT SOC codes)
- Germany Opportunity Card "guaranteed placement" agent scam
- Dubai / Cyprus crypto-IT job scams (forex / scam-compound recruitment fronts — KK Park, Myanmar pattern)
- Information-stealer malware delivered via fake "coding test" / "skills assessment" download

**Source constraints:** nccgroup.com (UK NCC threat intel — fake recruiter campaigns), ic3.gov (FBI IC3 — fake tech recruitment + scam-compound warnings), interpol.int (Pig butchering / scam-compound public advisories), ncsc.gov.uk (UK National Cyber Security Centre — recruitment phishing), gov.uk/government/publications/register-of-licensed-sponsors-workers (verify UK employer by NAME + ROUTE + RATING — the register CANNOT be filtered by IT SOC code; SOC eligibility is checked separately against Appendix Skilled Occupations + going-rate tables), enterprise.gov.ie (DETE — Employment Permits Online; permit verification; the Trusted Partner Initiative is no longer a separate public recruiter-verification register), cro.ie (Irish Companies Registration Office — verify a company in Ireland), gov.uk/find-an-immigration-adviser (Immigration Advice Authority adviser finder — IAA replaced OISC on 16 January 2025), portal.immigrationadviceauthority.gov.uk (IAA register), mara.gov.au (Migration Agents Registration Authority — verify any Australian migration agent), college-ic.ca (CICC — verify any Canadian paid immigration consultant; provincial / territorial law societies + Chambre des notaires du Québec also regulate paid reps; Law Society of Ontario regulates paralegals), make-it-in-germany.com (federal information portal — note: this is INFORMATION, applications go via German missions / Consular Services Portal or competent immigration authority), auswaertiges-amt.de, southafrica.diplo.de, digital.diplo.de / Consular Services Portal (Chancenkarte verification), canada.ca/en/immigration-refugees-citizenship (IRCC scam warnings page), immi.homeaffairs.gov.au (Department of Home Affairs scam warnings), Australian High Commission Pretoria visa-scam advisory (southafrica.embassy.gov.au), saps.gov.za, saps.gov.za/dpci/ (SAPS DPCI / Hawks — official commercial-crime pages), actionfraud.police.uk (UK fraud reporting), cybersecurityhub.gov.za (SA National Cybersecurity Hub / CSIRT), safps.org.za / Yima (SA Fraud Prevention Service identity-protection), in Germany report to local police via Onlinewache (NOT "Federal Police BKA" — BKA is the Federal Criminal Police Office, not a public reporting channel), HelloPeter, Daily Maverick, News24 — flag SA expat / r/cscareerquestionsEU / r/germany Reddit threads as anecdotal

**Iterations:** 6

---

## Note schemas

**SCAM PATTERN note:**
```markdown
---
type: scam_pattern
name:
aliases: []
category: [fake_big_tech_recruiter | fake_visa_agent | upfront_placement_fee | malware_coding_test | scam_compound_recruitment | fake_relocation_kit | crypto_forex_front]
target_destination: []
target_role: [software_developer | data_engineer | cybersecurity | devops | it_architect | it_support]
channels: [linkedin | whatsapp | telegram | email | facebook | indeed | dice | x_twitter | discord | github]
typical_fee_or_loss_zar:
malware_or_data_loss_risk: [yes | no | unknown]
reporting_channel_sa:
reporting_channel_destination:
evidence_strength: confirmed | alleged | rumoured
tags: [scam, ict, fraud, sa-specific, work-abroad]
sources:
  -
---

# Scam Pattern Name

How this scam specifically targets SA ICT workers — what makes it different from generic visa fraud (e.g. nursing job scams) or generic phishing.

## How It Works
Step-by-step from first contact to money / data / device loss.

## Red Flags Specific to ICT Recruitment
- Flag 1 (e.g. WhatsApp-first contact from a "Google recruiter" — Google's actual recruiters use formal email + scheduled video calls)
- Flag 2 (e.g. "coding-test downloader" — legitimate tests run in-browser on HackerRank / CoderPad / Codility)
- Flag 3 (e.g. request to install screen-share software outside Zoom / Teams / Google Meet)
- Flag 4 (e.g. "guaranteed Opportunity Card placement" — the Chancenkarte has no agent fast-track; the applicant applies directly to a German embassy)

## How to Verify Legitimacy
Specific actionable check:
- UK employer: verify NAME + ROUTE + RATING on the Register of Licensed Sponsors CSV; then check the role's SOC code is eligible under Appendix Skilled Occupations and pays at least the going rate (the register itself cannot be filtered by SOC)
- UK adviser / consultant: look up on the Immigration Advice Authority (IAA) register at gov.uk/find-an-immigration-adviser (IAA replaced OISC on 16 January 2025)
- Ireland employer: verify CRO registration at cro.ie + Employment Permits Online permit issuance at enterprise.gov.ie
- Germany: confirm via German Embassy Pretoria (southafrica.diplo.de) / Consular Services Portal (digital.diplo.de); the Chancenkarte cannot be "fast-tracked" by any agency — applications go via German missions only
- Canada paid representative: verify on the CICC public register (college-ic.ca); for lawyers, the relevant provincial / territorial law society; for paralegals in Ontario, the Law Society of Ontario; for Quebec notaries, Chambre des notaires du Québec
- Australia migration agent: check MARA / OMARA register at mara.gov.au/search-the-register

## Where to Report
- **In SA:** SAPS (general crime) / SAPS DPCI / Hawks (commercial crime — saps.gov.za/dpci/) / SA National Cybersecurity Hub (cybersecurityhub.gov.za) / SAFPS Yima (identity-protection — safps.org.za) / HelloPeter (consumer-side complaints, not law-enforcement)
- **In destination country:** Action Fraud (UK actionfraud.police.uk), IRCC fraud reporting (Canada), ACCC Scamwatch (Australia), local police / Onlinewache (Germany — NOT BKA, which is the federal criminal-investigation agency and does not take public reports), An Garda Síochána (Ireland), FBI IC3 (USA)

## Reported Instances
Known documented cases (date, source, outcome if known). Do not name individuals unless formally charged in an official source.

## Connections
- [[Verification Method]] — countered_by, source: [url]

## Sources
- [Source title](url)
```

**VERIFICATION METHOD note:**
```markdown
---
type: verification_method
name:
description:
applicable_destinations: []
official_register_url:
time_to_verify_minutes:
how_to_use:
evidence_strength: confirmed
tags: [verification, ict, scam-protection]
sources:
  -
---

# Verification Method Name

What this check proves and how an SA ICT worker performs it in under 5 minutes.

## Step-by-Step
1.
2.
3.

## Connections
- [[Scam Pattern]] — counters, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: countered_by | targets | reported_in | verified_via | documented_by | impersonates
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — distinguish official NCSC / FBI IC3 / Australian High Commission warnings from anecdotal Reddit / Facebook reports
- Never name individual scammers unless formally charged or named in an official SAPS / Hawks / Action Fraud / IRCC / IC3 source
- Every verification method must link to a live, primary, official register URL
- Focus on ICT-specific variants (fake Big Tech, malware coding tests, crypto-front jobs, fake Opportunity Card agents) — do not duplicate the generic scam content from wa-shared-scams
- Flag the scam-compound recruitment pattern (Myanmar / KK Park / Cambodia) — SA tech workers have been targeted with "Dubai / Bangkok crypto IT support" pretexts; cite Interpol and US State Department advisories
- Cite primary law-enforcement / regulator sources only for confirmed claims; if only an aggregator or forum source is available, set evidence_strength: alleged
- Folder structure: `Scam Patterns/`, `Verification Methods/`
