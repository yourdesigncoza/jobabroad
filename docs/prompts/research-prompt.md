# vault-builder Research Prompt Template

> **How to use (human):** Copy everything from the send-ready section below the second `---`, fill in the placeholders, then paste as your `/vault-builder` message.
> **How to use (LLM):** Read the Instructions for LLM block in full before generating anything.

---

## Instructions for LLM filling this template

You are generating a `/vault-builder` research prompt from user instructions. Follow these rules in order of criticality:

### 1. Do NOT begin research
vault-builder's P1 phase handles goal elicitation and P2 handles the seed round. Never add "Begin now with...", "Start by researching...", or any instruction to initiate research immediately. The skill manages the entire research loop. Your job is to produce the prompt — nothing more.

### 2. Never simplify or remove schemas
Every field in every note schema is intentional. Do not strip metadata because it looks verbose or redundant. The schemas drive structured, consistent output across all research rounds. Removing a field removes that data from every note ever created in this vault.

### 3. Every folder must have a matching schema
The `Folder structure` list and the `Note schemas` section must be in 1:1 correspondence. If you specify `People/`, there must be a PERSON schema. If you add a new entity type, you must add both a new schema AND a new folder. Never list a folder without a schema, and never create a schema without adding its folder.

### 4. If the domain has a recurring entity type not covered by existing schemas, add it
The base schemas (PERSON, ORGANISATION, GOVERNMENT BODY, CONTRACT, EVENT) cover most investigative domains. If the user's domain introduces a new entity type (e.g. `Bank Account`, `Shell Company`, `Policy Document`, `Vessel`), define a new schema for it and add the corresponding folder. Generalise this rule: one schema per entity type, one folder per schema.

### 5. evidence_strength is mandatory on every note — including stubs
A **stub note** is a placeholder created when a new entity is mentioned in research but not yet researched. Minimum stub content:

### 6. Establish Date or Time Period
Most research is for a specific time or period, this is important else the syatem will assume a different period.
```markdown
---
type: [entity type]
evidence_strength: alleged
tags: [[domain-specific tag]]
sources: []
---
# Entity Name
*stub — to be researched*
```
Never create a stub without `type`, `evidence_strength`, and `tags`. Default stub `evidence_strength` is `alleged` unless a confirmed source is already available.

### 6. Generate an EDGE block when a direct verifiable relationship exists
An EDGE block should be generated inside the body of one of the connected notes when:
- A source explicitly states a relationship between two named entities
- The relationship has a type that fits the `relationship_type` enum
- At least one source URL can be cited

Do not generate edges for implied or inferred relationships. Record the edge as a bullet in the `## Connections` section of the note where it is most contextually relevant.

### 7. Match the relationship_type enum to the domain
Replace the generic placeholders with verbs that reflect actual relationships in the user's domain. Examples:
- Corruption/fraud: `beneficial_owner | shell_company | money_laundering | bribed | facilitated | awarded_contract | implicated_with`
- Corporate: `subsidiary | shareholder | board_member | supplier | acquirer | joint_venture`
- Academic: `co_author | supervisor | peer_reviewed | cited_by | funded_by`

### 8. Apply domain-specific tags — not generic ones
Every schema has a `tags` field. Do not leave it as `[person]` or `[organisation]`. Add tags that reflect the user's domain and the entity's specific role. Examples for a corruption investigation: `[person, politician, anc, charged]` or `[organisation, soe, state-capture]`. Tags are used for Obsidian filtering and graph colouring — make them meaningful.

### 9a. Single-source rule — HARD RULE (no exceptions)

A specific number, date, fee, policy, or requirement may only enter a wiki note as fact if it can be verified from a **primary source** — the official government body, statutory regulator, or authoritative programme operator for that claim.

**If a claim can only be found on a single non-primary source (blog, aggregator, content farm, agency site, third-party "how to" article), it must NOT be recorded as fact.** Set `evidence_strength: alleged` and note the source limitation in the body. Do not promote it to `confirmed` without a primary source URL.

This rule exists because search results can surface plausible-sounding but wrong information from low-credibility sites. The vault feeds a guide that people pay for and make life decisions from. An incorrect fee, a closed visa route, or a wrong document requirement causes real harm.

**Vault-builder must fetch the primary source page and confirm the claim exists there before recording it as `evidence_strength: confirmed`.** A search snippet alone is not confirmation.

### 9. Source constraints must be specific
Do not leave source constraints as a vague preset. Use the table below to select the most appropriate preset for the user's domain, or combine presets. Then list the sources explicitly in the `Source constraints` field — do not reference the table name, paste the actual source list.

**Source preset reference:**

| Preset | Sources |
|---|---|
| Investigative | News24, Daily Maverick, amaBhungane, Mail & Guardian, Reuters, BBC, credible YouTube channels with 100k+ subscribers (save channel name, subscriber count, video URL) |
| Legal / Regulatory | lawlibrary.org.za, court records, tribunal findings, regulatory filings, Parliamentary registers |
| Financial / Corporate | CIPC company registry, JSE filings, annual reports, Bloomberg, Reuters financial, verified company registries |
| Academic / Policy | peer-reviewed journals (DOI required), HSRC, ISS, think-tank reports with named authors |
| Any web | any credible web source — flag evidence_strength honestly |

### 10. Expose iter_cap if the research scope is large or small
`iter_cap` controls how many research rounds vault-builder runs before halting (default: 10). Add an optional `**Iterations:** [number]` line to the prompt if the user's scope clearly warrants a different cap:
- Broad investigative topics (50+ entities expected): suggest 20–30
- Quick scoped research (5–10 entities): suggest 5
- Default (leave blank): 10

### 11. Canvas is on-demand only — never automatic
The canvas export section must remain commented out. Only uncomment it if the user explicitly says they want canvas output. It is not a session-end task, not a summary step, not something vault-builder does automatically.

### 12. Use consistent placeholder format: [placeholder_name]
Every field that needs filling must use `[placeholder_name]` format — lowercase, underscored, descriptive. Do not mix styles (`Entity 1`, `/path/to/vault`, `<your goal>`). Consistency makes it clear to humans exactly what to replace.

### 13. Self-check before outputting
Before producing your final output, verify:
- [ ] Every folder in `Folder structure` has a corresponding schema
- [ ] No "begin research" instruction anywhere in the prompt
- [ ] `evidence_strength` present on every schema including stubs
- [ ] `relationship_type` enum is domain-specific, not generic
- [ ] Tags are domain-specific on every schema
- [ ] Source constraints are explicit, not a preset name
- [ ] Canvas section is commented out (unless user explicitly requested it)

State your confidence level (1–10) that all checks pass before outputting.

---

## Golden example — filled-out PERSON note

This shows the expected output format for a completed note (not a stub):

```markdown
---
type: person
full_name: Jane Doe
aliases: [JD, "The Fixer"]
dob: 1968-03-14
age: 57
nationality: South African
role_type: political_operative
affiliation: ANC
current_position: Deputy Director-General, Department of Public Works (2019–present)
past_positions:
  - Chief of Staff, Presidency (2014–2019)
  - ANC Regional Secretary, Gauteng (2009–2014)
wealth_estimate: R12,000,000
charges:
  - Fraud (NPA case 2022/4471, pending)
evidence_strength: alleged
tags: [person, politician, anc, charged, state-capture]
sources:
  - https://www.dailymaverick.co.za/example-article
---

# Jane Doe

Jane Doe (born 14 March 1968) is a South African political operative who has served as Deputy Director-General of the Department of Public Works since 2019. She is alleged to have facilitated irregular tender awards to [[Acme Construction (Pty) Ltd]] during her tenure as Chief of Staff in the Presidency. The National Prosecuting Authority opened a fraud case against her in 2022, which remains pending.

## Connections
- [[President X]] — chief of staff, 2014–2019, source: Daily Maverick 2022-03-01
- [[Acme Construction (Pty) Ltd]] — alleged irregular tender facilitation, R45m, 2016–2018, source: amaBhungane 2021-11-15
- [[Department of Public Works]] — current employer, DDG since 2019, source: DPSA gazette

## Sources
- [Jane Doe fraud charges (Daily Maverick, 2022)](https://www.dailymaverick.co.za/example-article)
- [Acme tender investigation (amaBhungane, 2021)](https://amabhungane.org/example-article)
```

---

## Send-ready prompt (copy from here)

---

/vault-builder [vault_path]

**Goal:** [one_sentence_research_goal]

**Seed entities:**
- [entity_1]
- [entity_2]
- [entity_3]
- [entity_4]
- [entity_5_max]

**Source constraints:** [explicit_source_list]

**Iterations:** [iter_cap_number_or_delete_this_line_for_default_10]

---

## Note schemas — apply to every note created

> Adapt field names and tags to your domain. Keep evidence_strength and sources on every note type. Add new schemas for any entity type not covered below, and add the corresponding folder to the Folder structure.

**PERSON note:**
```markdown
---
type: person
full_name: 
aliases: []
dob: 
age: 
nationality: 
role_type: 
affiliation: 
current_position: 
past_positions: []
wealth_estimate: 
charges: []
evidence_strength: confirmed | alleged | rumoured
tags: [person, [domain_specific_tag]]
sources:
  - 
---

# Full Name

Short factual summary (2–4 sentences, neutral tone, press-sourced).

## Connections
- [[Other Entity]] — [relationship_type], [date_range], source: [publication_date]

## Sources
- [Article title](url)
```

**ORGANISATION note:**
```markdown
---
type: organisation
legal_name: 
registration_number: 
entity_type: 
founded: 
sector: 
directors: []
beneficial_owners: []
contracts: []
evidence_strength: confirmed | alleged | rumoured
tags: [organisation, [domain_specific_tag]]
sources:
  - 
---

# Legal Name

Summary.

## Connections
- [[Person Y]] — [relationship_type], [date_range], source: [publication_date]

## Sources
- [Article title](url)
```

**GOVERNMENT BODY note:**
```markdown
---
type: government_body
name: 
short_name: 
category: [department | commission | law_enforcement | regulatory_body]
jurisdiction: [National | Regional | Municipal]
head_or_minister: 
evidence_strength: confirmed | alleged | rumoured
tags: [government, [domain_specific_tag]]
sources:
  - 
---

# Name

Summary.

## Connections
- [[Person Y]] — [relationship_type], [date_range], source: [publication_date]

## Sources
- [Article title](url)
```

**CONTRACT note:**
```markdown
---
type: contract
title: 
reference_number: 
awarding_body: "[[entity_name]]"
recipient: "[[entity_name]]"
value: 
award_date: 
description: 
evidence_strength: confirmed | alleged | rumoured
tags: [contract, [domain_specific_tag]]
sources:
  - 
---

# Contract Title

Summary.

## Connections
- [[Awarding Body]] — awarded, [date], source: [publication_date]
- [[Recipient]] — received, [value], source: [publication_date]

## Sources
- [Article title](url)
```

**EVENT note:**
```markdown
---
type: event
name: 
date: 
location: 
participants: []
organisations_involved: []
outcome: 
evidence_strength: confirmed | alleged | rumoured
tags: [event, [domain_specific_tag]]
sources:
  - 
---

# Event Name

Summary of what happened (2–4 sentences, neutral tone).

## Connections
- [[Person Y]] — [role_in_event], source: [publication_date]
- [[Organisation X]] — [role_in_event], source: [publication_date]

## Sources
- [Article title](url)
```

**EDGE metadata (record on every direct verifiable connection):**
- `relationship_type`: [domain_specific_enum — e.g. family | donor | contractor | appointed_by | implicated_with]
- `description`: short label ("donor", "appointed", "awarded [value] contract")
- `date_range`: [YYYY–YYYY]
- `monetary_value`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules for vault-builder

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — never present allegations as fact; use neutral language ("reportedly", "alleged", "named in")
- Every note and every connection must cite at least one source URL
- Folder structure: `People/`, `Organisations/`, `Government/`, `Contracts/` *(add folders for any new schema types)*

---

## Canvas export (on-demand — generate only when user explicitly requests "generate canvas")

> Uncomment this section to enable. Canvas will only be generated when you explicitly ask for it.

<!--
Generate `wiki/[vault_name].canvas` using this schema:

{
  "nodes": [{"id": "uid", "type": "file", "file": "People/Name.md", "x": 0, "y": 0, "width": 400, "height": 200, "color": "1"}],
  "edges": [{"id": "eid", "fromNode": "uid1", "fromSide": "right", "toNode": "uid2", "toSide": "left", "label": "short label", "color": "4"}]
}

Colour codes: 1=red (charged/convicted), 2=orange (alleged), 3=yellow (linked), 4=green (org), 5=cyan (gov), 6=purple (family)
Layout: root node at x:0 y:0 · first-degree ~600 units out · second-degree ~1400 units out · stagger to avoid overlap
-->
