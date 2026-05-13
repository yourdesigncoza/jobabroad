# FINAL REPORT — wa-tefl-01-destinations

**Vault:** `/home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-01-destinations`
**Generated:** 2026-05-13
**Iterations run:** 7 (cap: 8)
**Goal:** Map realistic TEFL destination options for SA passport-holders in 2025–2026 — which countries explicitly accept SA candidates as native English speakers, current open hiring pipelines, degree-required vs. degree-optional routes, and honest earning potential per destination.

---

## Graph Structure

| Metric | Value |
|---|---|
| Concept nodes | 738 |
| Co-occurrence edges | 15,521 |
| Louvain modularity | 0.2428 |
| Topic clusters | 7 |
| Avg node degree | 42.06 |
| Wiki notes total | 79 |
| Destination notes | 10 |
| Programme Operator notes | 4 |
| Stub notes | 65 |
| Iterations logged | 6 |

**Top discourse bridges (highest betweenness centrality):** `spain`, `south`, `accessible`, `holder`, `african`, `tefl`, `qiwa`, `dhabi`, `english`, `programme`

**Structural gaps remaining:** spain ↔ china; spain ↔ scheme (NET/EPIK scheme context); china ↔ scheme; qiwa ↔ tefl; south ↔ tefl. These gaps suggest the Spain and China clusters have thin cross-community linkage — expected given Spain is a closed route and China is a distinct regulatory ecosystem.

---

## What Was Discovered

### 1. SA Native Speaker Status — Confirmed at Regulatory Level

South Africa is explicitly named on the 7-nation native English-speaker list underpinning **South Korea's E-2 Foreign Language Instructor Visa** and **Vietnam's Decree 219/2025/ND-CP** (effective August 7, 2025). The 7-nation list (USA, UK, Canada, Australia, New Zealand, Ireland, South Africa) means SA holders are exempt from IELTS/TOEFL requirements and are classified as native speakers without additional documentation in both countries. This is the strongest eligibility confirmation in the vault.

### 2. Destination Status Summary (10 destinations researched)

| Destination | SA Route Status | Salary (USD/month) | Degree Required | Key Bottleneck |
|---|---|---|---|---|
| South Korea | Open — E-2 eligible | $1,500–$2,100 | Yes | SAQA + schooling letters |
| Vietnam | Open — Decree 219 native speaker | $1,200–$2,300 | Yes + 2 yrs exp | Decree 219 devolves to provinces |
| Saudi Arabia | Open | $3,200–$8,000 tax-free | Yes | SARS R1.25M cap; Iqama chain |
| UAE | Open | $2,500–$5,500 | Yes | Competitive market; KHDA/ADEK |
| Japan | Open — JET Programme | $2,200–$3,200 | Yes | Oct deadline; ALT positions only |
| China | Open — 7-nation Z-visa list | $1,250–$2,850 | Yes | Non-Hague attestation; SAPS 6 weeks |
| Thailand | Open — "highly preferred" | $950–$1,500 | No (language centres) | Lowest earning; Non-B visa |
| Taiwan | Open — alleged (no primary source) | $1,600–$2,200 | Yes | Native speaker status unconfirmed |
| Hong Kong | Conditional — PGDE required | $4,100–$9,800 | Yes + PGDE | NET Scheme bar raised 2025/26 |
| Spain | RESTRICTED — not on bilateral list | EUR 700 stipend | n/a | Auxiliares closed to SA 2025–2026 |

### 3. SAQA — Unique SA Attestation Bottleneck

SA degree holders must obtain a SAQA Verification Letter before the standard DIRCO apostille step. No other E-2-eligible nationality faces this. The full chain (SAQA → DIRCO apostille → consulate/embassy legalisation) takes **8–12 weeks** and should start the moment a candidate chooses a destination. This is the most operationally important finding for SA TEFL job seekers.

### 4. Spain Route — Closed, Industry Guidance is Wrong

The Spain Auxiliares de Conversación Programme requires a bilateral educational agreement between Spain and the teacher's home country. The MEFD/AEE official 2025–2026 call lists 35 eligible countries; South Africa is not among them. Multiple industry blogs claim SA is eligible — this is incorrect. The route is closed for 2025–2026. SA candidates with EU dual citizenship may use EU-EEA freedom of movement to access private academy positions, but the Auxiliares programme itself is unavailable.

### 5. Hong Kong NET Scheme — Qualification Bar Raised

The EDB's 2025/26 NET Scheme recruitment page confirms that new joiners from 2025/26 onward require a PGDE majoring in English in addition to a degree and TEFL certificate. Industry guidance widely available online still cites only degree + TEFL as sufficient — this is outdated. SA candidates with a PGDE remain eligible; entry-level candidates without one are excluded.

### 6. Gulf Packages — Highest Earners with SARS Caveat

Saudi Arabia ($3,200–$8,000/month tax-free) and UAE ($2,500–$5,500/month) offer the highest gross earnings. However, SA residents must factor in the SARS Foreign Income Exemption cap of R1.25M/year — amounts above this threshold are taxable in SA, which affects net financial planning for higher-earning Gulf positions.

### 7. Vietnam — Decree 219 Devolves to Provinces

Work permit applications under Decree 219/2025/ND-CP are now processed by Provincial People's Committees rather than a central Ministry, which means processing times and specific document requirements can vary by city (Ho Chi Minh City, Hanoi, Da Nang). SA teachers should confirm provincial requirements with their employer-sponsor directly.

---

## Gaps and Limitations

1. **Taiwan native-speaker confirmation** — No primary regulatory source found confirming SA on an equivalent native-speaker list in Taiwan. The Taiwan destination note is marked `evidence_strength: alleged`. Candidates should contact the Bureau of Consular Affairs directly before applying.

2. **Spain 2026–2027 eligibility** — Whether SA will be added to the bilateral agreement list for the next academic year is unknown.

3. **Korea private hagwon pipeline** — EPIK and GOE/GEPIK public school routes are well documented. Independent hagwon hiring via private recruiters is less well documented; the hollow-hub note for Hagwon was created but not researched in depth.

4. **Gulf SARS modelling** — The R1.25M exemption cap interaction with typical Gulf package values was not modelled in detail; candidates should consult a South African tax practitioner.

5. **China city-level variation** — Tier-1 vs Tier-2/3 city salary and lifestyle differences were documented at a high level but not researched in depth for specific cities beyond Beijing/Shanghai.

---

## Vault Health

- **Wikilink resolution:** CLEAN — 0 unresolved wikilinks, 0 heading-only notes, 0 orphan root files (verified by resolve_wikilinks.py --check)
- **Note count:** 79 notes (77 indexed + Conclusion + index)
- **Stub coverage:** All stubs have mandatory body text (2–4 sentence minimum); no phantom nodes
- **Source coverage:** 24 raw source files across 12 topic directories; 10 destinations covered by primary or verified secondary sources
- **Evidence strength:** 8 destinations confirmed; 1 alleged (Taiwan); 1 restricted-confirmed (Spain)
- **Open questions:** 3 open question files; key unresolved items documented in wiki/Conclusion.md

---

## Recommended Next Step

The vault is ready to feed the `build-pathway` pipeline for the TEFL teaching guide. The most immediately actionable content for an SA teacher is:

1. The 7-nation native-speaker status confirmation (Korea + Vietnam) — should anchor Section 1 destination options
2. The SAQA 8–12 week bottleneck — should be prominent in any document checklist section
3. The Spain closed-route finding — prevents wasted applications
4. The Korea vs Vietnam vs Thailand entry-level comparison — clearest decision framework for first-time SA TEFL candidates
