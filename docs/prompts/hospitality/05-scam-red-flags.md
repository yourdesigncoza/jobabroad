# Prompt: Hospitality — Scam Red Flags

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-hospitality-05-scams`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-hospitality-05-scams

**Goal:** Map the scam patterns specifically targeting South African hospitality workers — fake UAE hotel job + upfront fee, fake UK chef placement (post-22-July-2025 closed routes), cruise/yacht hospitality scam with "maritime visa" + uniform deposit, fake CoS sale, "fly to Dubai on tourist visa and find a job" scheme, bogus Canadian hotel agency demanding LMIA fee from worker. For each scam pattern, document where it appears (Facebook groups, WhatsApp channels, Telegram, TikTok), the typical financial damage, and the official verification methods + reporting channels.

**Seed entities:**
- Fake UAE hotel job with upfront "registration fee" — most common scam pattern; AED 8,000–15,000/month chef position bait, R3,000–R10,000 demanded upfront
- Fake UK chef placement after 22 July 2025 — recruiters still advertise UK Skilled Worker visa for line cook / waiter / barista; salary often quoted £20,000–£30,000 (below £41,700 threshold)
- Cruise ship / yacht hospitality scam with "maritime visa" + "uniform deposit" — USD $3,000–5,000/month claims; demand for "training fee", "visa processing fee", "maritime medical deposit" before signing
- Fake CoS for sale on WhatsApp/Telegram channels — £3,000–£8,000 for fraudulent UK Certificate of Sponsorship
- "Tourist-visa-and-find-a-job-in-Dubai" pitch — recruiters tell SA workers to fly on visit visa and look for hospitality work on arrival; UAE work without permit is a deportable offence

**Source constraints:** mohre.gov.ae, u.ae, gdrfa.ae, gov.uk/report-an-immigration-or-border-crime, gov.uk/government/organisations/uk-visas-and-immigration, actionfraud.police.uk, immi.homeaffairs.gov.au, immi.homeaffairs.gov.au/help-support/scams, southafrica.embassy.gov.au/pret/visascams.html, scamwatch.gov.au, canada.ca/en/services/jobs/foreign-workers/protection.html, antifraudcentre-centreantifraude.ca, saps.gov.za, deltacommission.org.za (DEL — Department of Employment and Labour), embassy.gov.za, dirco.gov.za

**Iterations:** 6

---

## Note schemas — apply to every note created

**SCAM_PATTERN note:**
```markdown
---
type: scam_pattern
name:
target_route_or_country:
typical_pitch:
upfront_fee_demand:
typical_damage_zar:
where_it_appears: [facebook | whatsapp | telegram | tiktok | linkedin | recruiter-website | dating-app | mixed]
how_to_verify_pitch: []
reporting_channel:
official_warning_url:
evidence_strength: confirmed | alleged | rumoured
tags: [scam-pattern, hospitality, south-africa]
sources:
  -
---

# Scam Pattern Name

3–5 sentences describing the pitch as the SA hospitality worker would encounter it. Use realistic amounts, channels, and language patterns.

## Why This Targets SA Hospitality Workers Specifically
What about SA hospitality job seekers makes this pattern profitable for fraudsters (e.g. UAE diaspora visibility, English ability, willingness to relocate, salary differential).

## How to Verify the Pitch Is Fraudulent
Specific official-source checks: (1) verify employer trade licence on UAE National Economic Register; (2) verify UK sponsor on gov.uk Register of Worker and Temporary Worker Sponsors; (3) check current eligible occupation list for the role; (4) verify recruiter against MARA register (Australia) / OISC (UK) / ICCRC (Canada).

## Where to Report
Specific URLs and SA-side + destination-side channels.

## Connections
- [[Reporting Channel]] — report_to, source: [url]
- [[Restricted Route]] — exploits, source: [url]

## Sources
- [Official scam warning URL](url)
```

**VERIFICATION_METHOD note:** *(create one per official check method)*
```markdown
---
type: verification_method
name:
applies_to:
official_url:
how_to_use:
expected_result_legitimate:
expected_result_fraudulent:
evidence_strength: confirmed
tags: [verification-method, hospitality, south-africa]
sources:
  -
---

# Verification Method Name

Plain instruction: how to use this check, what data goes in, what answer means legitimate vs fraudulent.

## Step-by-Step
1. Go to [URL]
2. Enter [field]
3. Confirm result matches expected pattern.

## Connections
- [[Scam Pattern]] — verifies_against, source: [url]

## Sources
- [Official verification URL](url)
```

**EDGE metadata:**
- `relationship_type`: targets | exploits | verifies_against | report_to | issues_warning_about | mimics
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **Channel-naming required** — for every scam pattern, name the platforms where it most commonly appears (Facebook hospitality job groups, Telegram channels, WhatsApp broadcast lists, TikTok recruiter videos, LinkedIn DMs from "recruiters"). Generic "online" descriptions are not specific enough
- **UAE employer-paid rule (MOHRE Resolution No. 47 of 2022)** — every "registration fee" / "visa processing fee" / "Emirates ID processing" demand to a worker is a federal violation. Cite this rule in every UAE scam pattern
- **UK CoS-for-sale is a federal-level criminal offence** in the UK — Modern Slavery Act + Immigration Act considerations. Reporting via Action Fraud + UKVI
- **UK 22 July 2025 closed-route exploitation** — recruiters still advertising UK chef visas for line cooks / waiters / baristas are either uninformed or fraudulent. Verify by checking current eligible occupation list at gov.uk/government/publications/skilled-worker-visa-eligible-occupations
- **Dubai tourist-visa work scam** — UAE entry on visit visa does not permit working. Working on visit visa results in fines (AED 200/day overstay + work-related fines), deportation, possible 1-year ban. Document the legal consequence explicitly
- **Cruise / yacht hospitality scams** — legitimate cruise lines (Carnival, Royal Caribbean, MSC, Princess, Holland America) recruit via published agency partners only. Name verified cruise-line career portals and warn that any "uniform deposit" or "training fee" is fraudulent
- **SA-side reporting channels** — SAPS Cybercrime, DEL (Department of Employment and Labour) for recruitment fraud, the destination embassy in SA for visa fraud. Name all three
- **Romance / dating-app hospitality scams** — increasingly common: "fiancé in Dubai will fly you over for hotel job" pattern combining romance scam + visa fraud. Document briefly with reference to anti-fraud centres
- **Maritime fishing-vessel scam** — same upfront-fee pattern as cruise scam but framed as commercial fishing rather than passenger cruise. Same red flags apply
- All scam pattern descriptions must include realistic ZAR damage figures and at least one official verification or reporting URL
- Folder structure: `Scam Patterns/`, `Verification Methods/`, `Reporting Channels/`
