## 5. Scam Red Flags — Will I Get Scammed?

SA IT professionals are targeted specifically because the pathway is real, in-demand, and technically complex — which gives fraudsters a credible script. The scams below are not generic work-abroad fraud. They exploit tools developers use daily: GitHub, LinkedIn, coding assessments, npm packages. Each pattern below has a specific counter. Every check on the verification table takes under five minutes using free official registers.

---

### The One Rule That Covers Everything

**No legitimate employer, visa agent, or government body in any IT migration pathway charges the candidate a recruitment or placement fee.**

Under the South African Employment Services Act 4 of 2014, no person may charge a work-seeker any fee for employment services. This applies to every country in this guide. Legitimate tech recruiters in Ireland, the UK, Germany, Canada, and Australia are paid by the employer — not the candidate. Any upfront fee is a scam, every time.
<!-- src: tier=primary | url=https://www.labour.gov.za/DocumentCenter/Acts/Employment%20Services/Employment%20Services%20Act%204%20of%202014.pdf | path=shared | claim_id=05-scams-001 -->

---

### ICT Scams Are Technically Distinct

Generic work-abroad fraud relies on financial desperation. ICT-specific scams rely on **professional trust in technical processes**. The Contagious Interview campaign delivers malware through coding assessments — the exact activity developers are trained to perform. Fake Big Tech recruiter contact via LinkedIn exploits platform norms around recruiter outreach. Germany Opportunity Card agent fraud exploits unfamiliarity with German bureaucracy. None of these scams require a desperate victim; they require a professionally engaged one.
<!-- src: tier=primary | url=https://www.microsoft.com/en-us/security/blog/2026/03/11/contagious-interview-malware-delivered-through-fake-developer-job-interviews/ | path=Scam Patterns/Contagious Interview Malware.md | claim_id=05-scams-002 -->

**For developers specifically:** credential theft via malware delivers cascading losses beyond personal data — cloud infrastructure access (AWS, Azure, GCP), CI/CD pipeline keys, source code, and employer systems. The professional consequences extend beyond the individual victim.
<!-- src: tier=primary | url=https://www.microsoft.com/en-us/security/blog/2026/03/11/contagious-interview-malware-delivered-through-fake-developer-job-interviews/ | path=Scam Patterns/Contagious Interview Malware.md | claim_id=05-scams-003 -->

---

### Six Documented Scam Patterns

| Pattern | Primary risk | Evidence |
|---|---|---|
| Fake Big Tech Recruiter Scam | Fees + malware delivery | Confirmed (FTC, Microsoft, Reuters) |
| Contagious Interview Malware | Device + credential compromise | Confirmed (Microsoft March 2026) |
| Scam Compound Recruitment | Trafficking / physical safety | Confirmed (INTERPOL, Reuters, UN) |
| Germany Opportunity Card Agent Fraud | Upfront fees, visa outcome unaffected | Alleged (community evidence) |
| Dubai Crypto IT Job Scam | Trafficking / financial | Confirmed (FBI, Dubai Police 2026) |
| Malicious Document Delivery via Fake Agents | Device compromise + identity theft | Alleged (documented pattern, SA-specific cases not confirmed) |

---

### Pattern 1: Fake Big Tech Recruiter Scam

Scammers create convincing LinkedIn profiles impersonating recruiters from Google, Microsoft, Amazon, or major SA-destination tech companies. They message developers who have the "Open to Work" badge active — using it as a targeting signal — and offer remote-then-relocate roles with above-market salaries. After initial conversation, they extract either upfront fees ("visa processing deposit," "equipment advance") or lead the candidate to a fake coding assessment delivering malware.
<!-- src: tier=secondary | url=https://www.reuters.com/technology/linkedin-fake-accounts/ | path=Scam Patterns/Fake Big Tech Recruiter Scam.md | claim_id=05-scams-004 -->

LinkedIn removed 80.6 million fake accounts in H2 2024, confirming the platform is actively used for recruitment impersonation at scale.
<!-- src: tier=secondary | url=https://about.linkedin.com/blog/2025/linkedin-transparency-report-h2-2024 | path=Scam Patterns/Fake Big Tech Recruiter Scam.md | claim_id=05-scams-005 -->

FTC-tracked job scam losses in the US reached USD$501 million in 2024 — the "job offer" category is now the highest-volume scam channel tracked by the FTC.
<!-- src: tier=primary | url=https://www.ftc.gov/reports/consumer-sentinel-network | path=Scam Patterns/Fake Big Tech Recruiter Scam.md | claim_id=05-scams-006 -->

**Red flags:**
- Recruiter contacts you first, unsolicited, about a very specific role matching your profile
- Offer arrives via LinkedIn message, WhatsApp, or Telegram — not via a company careers portal
- Email address is Gmail, Yahoo, or Hotmail rather than a verified company domain
- Salary is significantly above the market rate for the role and destination
- Job does not appear on the company's official careers page when you check directly
- Any request for bank details, ID documents, or fees before a formal application has started

**What to do instead:**
- Verify the recruiter's email domain matches the company they claim to represent
- Search the company's official careers page for the specific role — if it is not listed, the offer is not real
- Search the recruiter's LinkedIn profile creation date; scam profiles are typically days or weeks old
- For UK roles: check the [UK Register of Licensed Sponsors](https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers) — the employer must appear there to legally sponsor a visa

---

### Pattern 2: Contagious Interview Malware

Confirmed by Microsoft Security in March 2026. Threat actors pose as crypto, AI, or tech company recruiters and send candidates a GitHub repository, ZIP archive, or ISO file containing what appears to be a coding challenge (FizzBuzz, Node.js skills test, Python assessment). The candidate is instructed to clone the repo and run `npm install`, `pip install`, or a setup script. Malware executes on first run and installs backdoors (OtterCookie, FlexibleFerret) or information-stealers (FogDoor).
<!-- src: tier=primary | url=https://www.microsoft.com/en-us/security/blog/2026/03/11/contagious-interview-malware-delivered-through-fake-developer-job-interviews/ | path=Scam Patterns/Contagious Interview Malware.md | claim_id=05-scams-007 -->

The FogDoor variant (documented by Cyble, March 2025) used a GitHub repository named "FizzBuzz" — one of the most recognised coding exercise names — to deliver an information stealer via an ISO file. The repository was named "Rekrutacja-JS" (Polish for "JS Recruitment").
<!-- src: tier=secondary | url=https://cyble.com/blog/fake-coding-challenges-steal-sensitive-data-via-fogdoor/ | path=Scam Patterns/Contagious Interview Malware.md | claim_id=05-scams-008 -->

ReversingLabs documented Python_Skill_Assessment.zip and Python_Skill_Test.zip — malicious Python packages seeded via LinkedIn fake recruiter profiles — as separate variants of the same pattern.
<!-- src: tier=secondary | url=https://www.reversinglabs.com/blog/fake-recruiter-coding-tests-target-devs-with-malicious-python-packages | path=Scam Patterns/Contagious Interview Malware.md | claim_id=05-scams-009 -->

**Red flags (coding-test specific):**
- You are asked to download anything to run a "coding test" — all legitimate technical assessment platforms (HackerRank, CoderPad, Codility, LeetCode, CodeSignal) run entirely in-browser; no download needed
- `npm install` or `pip install` is the first step in a "skills test" you have been sent
- The GitHub account hosting the repository was created days or weeks ago (check github.com/[username])
- Short URLs (bit.ly, tinyurl) linking to Mega, Google Drive, or Dropbox containing ZIP or ISO files
- Instructions to disable antivirus or "allow unknown publishers" — no legitimate assessment requires this
- You have not had a scheduled video interview with a human before being sent the technical task
- The recruiter sends a command to paste directly into your terminal "to set up the environment"

**What to do instead:**
- Before running any recruiter-provided code, check the GitHub account creation date
- Run any archive through [VirusTotal](https://www.virustotal.com) before extracting
- Verify the specific role appears on the company's official careers page before doing any task
- Use a disposable virtual machine or sandboxed environment if you must run code from an unknown source
- Report to the SA National Cybersecurity Hub at [cybersecurityhub.gov.za](https://www.cybersecurityhub.gov.za) if you suspect compromise

---

### Pattern 3: Scam Compound Recruitment (Life-Safety Risk)

This pattern is categorically different from financial fraud. Victims are physically trafficked. It is not merely a financial threat.

Fake advertisements for "crypto customer support," "IT support specialist," "digital marketing analyst," or "online sales representative" are posted on Facebook, LinkedIn, Telegram, and job boards. Salaries of R80,000–R200,000 per month are advertised for roles described as simple support work. The listed office is Dubai, Bangkok, or Manila. After a smooth WhatsApp interview and quick offer, the recruiter arranges flights. On arrival, the victim is met by handlers who take their passport "for registration" and transport them to criminal compounds in Myanmar, Cambodia, or Laos — including KK Park (Myawaddy, Myanmar) — where they are forced under threat of violence to conduct romance-baiting and investment fraud targeting Western victims.
<!-- src: tier=primary | url=https://www.interpol.int/News-and-Events/News/2024/INTERPOL-Financial-Fraud-assessment-A-global-threat-boosted-by-technology | path=Scam Patterns/Scam Compound Recruitment.md | claim_id=05-scams-010 -->

KK Park, operated by Chinese criminal gangs and the Karen Border Guard Force in Myawaddy, Myanmar, is the most documented compound. It was partially cleared by the Myanmar military in early 2025, with 2,000 people freed. PBS NewHour (2025) documented more than 200 African workers at KK Park. Reuters documented a 39-year-old East African IT consultant lured to Bangkok and trafficked there.
<!-- src: tier=secondary | url=https://www.pbs.org/newshour/world/why-southeast-asias-online-scam-industry-is-so-hard-to-shut-down | path=KK Park.md | claim_id=05-scams-011 -->
<!-- src: tier=secondary | url=https://www.reuters.com/graphics/SOUTHEASTASIA-SCAMS/mypmxwdwwvr/ | path=KK Park.md | claim_id=05-scams-012 -->

The UN Office on Drugs and Crime estimated 220,000 people were forced to work in scam operations across Myanmar and Cambodia as of 2023; that figure has not decreased.
<!-- src: tier=primary | url=https://www.unodc.org/roseap/en/myanmar/2023/12/human-trafficking/story.html | path=Scam Patterns/Scam Compound Recruitment.md | claim_id=05-scams-013 -->

SA-specific: at least 41 South African citizens were held in KK Park in October 2025, recruited via Facebook ads offering R15,000/month "tech support" roles in "Thailand," with flights booked from OR Tambo, Cape Town International, and King Shaka International airports. DIRCO launched a public alert campaign in response.
<!-- src: tier=primary | url=https://www.dirco.gov.za/alerts/ | path=shared/wa-shared-scams | claim_id=05-scams-014 -->

INTERPOL's largest-ever global operation in November 2024 — 116 countries, 2,500+ arrests — specifically targeted these scam-compound trafficking networks.
<!-- src: tier=primary | url=https://www.interpol.int/News-and-Events/News/2024/INTERPOL-Financial-Fraud-assessment-A-global-threat-boosted-by-technology | path=Scam Patterns/Scam Compound Recruitment.md | claim_id=05-scams-015 -->

**Red flags:**
- "Crypto IT support," "digital marketing," or "online sales" role in Dubai, Bangkok, or Manila with R80,000–R200,000/month salary for minimal-sounding work — this is not a realistic market rate for legitimate support roles
- Quick offer with no technical assessment and no background check
- Recruiter arranges and books your flights before you have signed any contract
- You are asked to keep the offer confidential from family
- Any employer who takes your passport "for registration" after arrival — this is a trafficking indicator and a violation of South African and international law
- Vague destination (e.g., "Bangkok office" or "Dubai region") with no verifiable physical address at a named commercial building

**What to do instead:**
- Google the company name plus "scam" plus "Myanmar" and "KK Park" before proceeding
- Verify the company has a registered office at the address given using Google Maps Street View
- Check US State Department travel advisories for Myanmar at [travel.state.gov](https://travel.state.gov) — Myanmar is at Level 4 (Do Not Travel) as of 2026
- Contact the SA Embassy in the stated destination country before travel; if the company is legitimate, the embassy will have records of it
- If already trapped overseas: contact DIRCO emergency services immediately — [dirco.gov.za](https://www.dirco.gov.za/south-africans-abroad/) — SA embassies have consular emergency services for citizens in distress
- Report to SAPS DPCI / Hawks before travel if you suspect trafficking: 0800 01 10 11

---

### Pattern 4: Germany Opportunity Card Agent Fraud

Agents charge SA IT workers R5,000–R50,000 for "guaranteed Chancenkarte placement," "fast-track visa preparation," or "DETE/Embassy insider access." No such service exists. The Opportunity Card (Chancenkarte) application goes directly to the German Embassy Pretoria or via the Consular Services Portal — there is no agency track. The entire self-application process uses free tools at [make-it-in-germany.com](https://www.make-it-in-germany.com).
<!-- src: tier=primary | url=https://www.make-it-in-germany.com/en/visa-residence/types/opportunity-card | path=Germany Opportunity Card Agent Scam.md | claim_id=05-scams-016 -->

A secondary risk: housing scams targeting Chancenkarte holders who have arrived in German cities and are searching for accommodation while job-hunting.
<!-- src: tier=secondary | url=https://www.make-it-in-germany.com/en/living-in-germany/housing | path=Germany Opportunity Card Agent Scam.md | claim_id=05-scams-017 -->

**Red flags:**
- Any agent charging upfront fees to "apply on your behalf" for the Chancenkarte — the application is a direct Embassy submission, not an agency service
- Claims of "guaranteed placement" — no agent can guarantee visa approval or job placement
- Requests to hand over passport, university certificates, or bank statements to an agent before any Embassy contact

**What to do instead:**
- Run the self-assessment points calculator at [make-it-in-germany.com/en/visa-residence/types/opportunity-card](https://www.make-it-in-germany.com/en/visa-residence/types/opportunity-card) — it is free and takes under 10 minutes
- Apply directly via the German Embassy Pretoria ([southafrica.diplo.de](https://southafrica.diplo.de)) or the Consular Services Portal ([digital.diplo.de](https://digital.diplo.de))
- The only mandatory cost is a €75 visa application fee, paid directly to the Embassy, plus proof of blocked account funds of €1,091/month (2026 figure — verify current amount at make-it-in-germany.com before applying)
<!-- src: tier=primary | url=https://www.make-it-in-germany.com/en/visa-residence/types/opportunity-card | path=Germany Opportunity Card Agent Scam.md | claim_id=05-scams-018 -->

---

### Pattern 5: Dubai Crypto IT Job Scam

Dubai operates as both a destination (forced fraud boiler rooms) and a transit hub for onward trafficking to Southeast Asian compounds. The Dubai-facing variant presents as a legitimate UAE-based crypto trading or fintech company with "IT support" or "blockchain developer" roles. The company may have a real Dubai trade licence but no actual tech operations.

In H1 2025, UAE crypto fraud victims lost an average of USD$80,000 per victim — the highest per-victim loss globally tracked by Chainalysis (2025 Crypto Crime Report, as verified at the time of research).
<!-- src: tier=secondary | url=https://www.chainalysis.com/blog/2025-crypto-crime-report-introduction/ | path=Scam Patterns/Dubai Crypto IT Job Scam.md | claim_id=05-scams-019 -->

In May 2026, Dubai Police in coordination with the FBI and Chinese Ministry of Public Security arrested 276 people, shut 9 fraud centres, and seized USD$701 million.
<!-- src: tier=primary | url=https://www.dubaipolice.gov.ae/dp/en/news/2026/05/scam-fraud-operation.html | path=Scam Patterns/Dubai Crypto IT Job Scam.md | claim_id=05-scams-020 -->

**Red flags:**
- "Crypto trading assistant," "blockchain support," or "DeFi customer service" role with high salary and vague technical requirements
- Company does not appear on the UAE VARA (Virtual Assets Regulatory Authority) register, which lists all regulated virtual asset service providers in the UAE
- Recruiter offers to arrange travel and visa before a signed contract with a verifiable employer
- Role described as entry-level but salary is R100,000+ per month

**What to do instead:**
- Verify any UAE-based crypto or fintech employer on the VARA register at [varaemirates.com](https://www.varaemirates.com) — any company offering crypto-related roles in Dubai must hold a VARA licence
- Verify the company trade licence at the [Dubai Economy and Tourism business register](https://www.dubaibusiness.ae) before any engagement
- Search the company name plus "scam" on FBI IC3 (ic3.gov) and Chainalysis public alerts before proceeding

---

### Pattern 6: Malicious Document Delivery via Fake Agents

A bridge pattern that links fake immigration agents to malware delivery. Operators pose as licensed migration consultants and send "visa approval letters," "Certificate of Sponsorship documents," or "employment contracts" as PDF or Word file attachments — containing embedded malware. Canada's IRCC documented 9,000+ fraud investigations per month in 2024 related to fake immigration documents; IRCC removed LMIA Express Entry points in March 2025 specifically to reduce document fraud incentive.
<!-- src: tier=primary | url=https://www.canada.ca/en/immigration-refugees-citizenship/news/2025/03/ircc-removes-lmia-express-entry.html | path=Scam Patterns/Malicious Document Delivery via Fake Agents.md | claim_id=05-scams-021 -->

Note: SA-specific cases of this pattern involving malware payloads were not confirmed in available sources as of May 2026. The pattern is documented globally; treat accordingly.
<!-- src: tier=secondary | url=https://www.canada.ca/en/immigration-refugees-citizenship/services/protect-fraud.html | path=Scam Patterns/Malicious Document Delivery via Fake Agents.md | claim_id=05-scams-022 -->

**Red flags:**
- Any PDF or Word document arriving from an immigration agent before you have initiated an application on an official portal
- Document requires enabling macros or "enabling content" — never do this
- Certificate of Sponsorship document sent to you directly — in the real UK visa process, the employer submits the CoS on the UKVI portal and you receive a CoS reference number, not a document file
- LMIA document for Canada sent as an email attachment from an agent — a real LMIA is issued by Employment and Social Development Canada to the employer, not to the candidate

**What to do instead:**
- Verify any UK immigration adviser on the [Immigration Advice Authority register](https://www.gov.uk/find-an-immigration-adviser) at gov.uk (the IAA replaced OISC on 16 January 2025)
<!-- src: tier=primary | url=https://www.gov.uk/find-an-immigration-adviser | path=Verification Methods/UK Register of Licensed Sponsors.md | claim_id=05-scams-023 -->
- Verify any Canadian immigration consultant on the [CICC register](https://college-ic.ca) at college-ic.ca — only CICC-registered consultants may charge for Canadian immigration services
<!-- src: tier=primary | url=https://college-ic.ca/protecting-the-public/find-an-immigration-consultant | path=Verification Methods/Canada CICC.md | claim_id=05-scams-024 -->
- Verify any Australian migration agent on the [MARA register](https://www.mara.gov.au) at mara.gov.au
<!-- src: tier=primary | url=https://www.mara.gov.au/consumer-protection/search-the-register/ | path=Verification Methods/Australia MARA.md | claim_id=05-scams-025 -->

---

### Verification Checks — Under Five Minutes Each

| Check | URL | What it defeats |
|---|---|---|
| UK Register of Licensed Sponsors | [gov.uk/government/publications/register-of-licensed-sponsors-workers](https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers) | Fake UK tech employers; unregistered agencies |
| UK Immigration Advice Authority register | [gov.uk/find-an-immigration-adviser](https://www.gov.uk/find-an-immigration-adviser) | Unlicensed UK immigration advisers (IAA replaced OISC Jan 2025) |
| Ireland CRO company register | [cro.ie](https://www.cro.ie) | Fake Irish employer registrations |
| Germany Chancenkarte self-assessment | [make-it-in-germany.com](https://www.make-it-in-germany.com/en/visa-residence/types/opportunity-card) | Germany agent scams; unnecessary fees |
| Canada CICC consultant register | [college-ic.ca](https://college-ic.ca/protecting-the-public/find-an-immigration-consultant) | Unlicensed Canadian immigration consultants |
| Australia MARA register | [mara.gov.au](https://www.mara.gov.au/consumer-protection/search-the-register/) | Unlicensed Australian migration agents |
| UAE VARA register | [varaemirates.com](https://www.varaemirates.com) | Dubai crypto job fronts; unregulated virtual asset employers |

---

### What Legitimate Employers and Programmes Never Ask For

| They will never ask you to... | Why it is a red flag |
|---|---|
| Pay a placement or registration fee | Employment Services Act 4 of 2014 bans all candidate-side recruitment fees |
| Download and run code as part of a "skills test" | All legitimate technical assessment platforms run entirely in-browser |
| Run `npm install` or `pip install` from a recruiter-provided archive on your own machine | This is the exact method used to deliver the Contagious Interview malware |
| Hand over your passport to an employer or agent before arrival at immigration | Passport confiscation after arrival is a trafficking indicator |
| Travel before signing a contract with a verifiable employer and physical address | No legitimate overseas employer arranges travel before a signed contract exists |
| Pay visa fees to an agent rather than directly to a government portal | All visa fees go directly to the relevant government portal |
| Keep your job offer confidential from family and friends | This is a social isolation technique used in trafficking recruitment |
| Communicate exclusively on WhatsApp with no institutional email trail | Legitimate employers and regulators use verified institutional email addresses |

---

### Where to Report

| Agency | Contact | Use for |
|---|---|---|
| **SAPS** | 10111 / [saps.gov.za](https://www.saps.gov.za) | Fraud, impersonation, false pretences |
| **Hawks (DPCI)** | 0800 01 10 11 / [saps.gov.za/dpci](https://www.saps.gov.za/dpci/) | Large-scale fraud (R100,000+); trafficking suspicion before travel |
| **DIRCO Emergency (overseas)** | [dirco.gov.za/south-africans-abroad](https://www.dirco.gov.za/south-africans-abroad/) | If trapped overseas; SA Embassy consular emergency |
| **SA National Cybersecurity Hub** | [cybersecurityhub.gov.za](https://www.cybersecurityhub.gov.za) | Malware delivery; credential theft; coding-test compromise |
| **SA Fraud Prevention Service** | 0800 222 999 / [safps.org.za](https://www.safps.org.za) | Identity document theft; impersonation downstream |
| **Dept of Employment and Labour** | 0800 220 818 / [labour.gov.za](https://www.labour.gov.za) | Unlicensed placement agencies charging fees |
| **Action Fraud (UK)** | [actionfraud.police.uk](https://www.actionfraud.police.uk) / 0300 123 2040 | UK-destined fraud; accepts SA reports |
| **FBI IC3** | [ic3.gov](https://www.ic3.gov) | Contagious Interview malware; scam compound operators; US-linked fraud |
| **ACCC Scamwatch (Australia)** | [scamwatch.gov.au](https://www.scamwatch.gov.au) | Australia-destined IT job scams |

Before contacting SAPS or Hawks, gather: all written communication (WhatsApp screenshots, emails, LinkedIn messages), documents received (fake offer letters, fake CoS files), payment records (EFT receipts, bank statements), and any identity details for the scammer (name, account number, LinkedIn profile URL). A complete report significantly increases the chance of action.
