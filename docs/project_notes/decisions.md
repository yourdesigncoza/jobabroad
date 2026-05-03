# Architecture Decision Records

---

## ADR-001: Operate as an information product, not an immigration advice service

**Date:** 2026-05-03  
**Status:** Confirmed

**Context:** Jobabroad sells a R199 content product (field guides, document checklists, visa route overviews) to South Africans seeking work abroad. Immigration advice is regulated in multiple destination countries. The question was whether the product model crosses into regulated territory.

**Decision:** Jobabroad will remain strictly an *information product* — general guides for categories of workers, never one-on-one case consultation. No content will be tailored to a specific named individual's circumstances.

**Rationale:** Research across 6 jurisdictions confirmed that the regulatory trigger is individual tailoring ("relates to a particular individual"). General information distributed publicly is universally outside regulatory scope. See `wa-shared-legal-boundary` vault and `FINAL_REPORT.md`.

**Consequences:**
- Content must never tell a specific user whether they personally qualify for a visa
- No paid consultations, no application review, no document checking for individuals
- NZ and Canada carry the highest legal risk for offshore providers — both explicitly extraterritorial. General guides remain safe; one-on-one paid guidance does not.
- SA's current legal position is maximally permissive (s.46 repealed 2014)

---

## ADR-002: Standard disclaimer on all content and at point of sale

**Date:** 2026-05-03  
**Status:** Confirmed

**Context:** South Africa's Consumer Protection Act 68 of 2008 (ss.22 and 49) requires plain-language disclaimers drawn to the consumer's attention before purchase. NZ and Canada also expect information services to clearly disclaim that they are not providing regulated advice.

**Decision:** Every content piece and the payment/purchase flow will include the following standard disclaimer:

> "This content is general information about work-abroad pathways and does not constitute immigration advice. It is not tailored to your individual circumstances. For advice about your specific situation, consult a licensed immigration adviser, registered migration agent, or immigration attorney in the relevant country."

Where content covers a specific destination, add the relevant regulator's register URL (iaa.govt.nz, register.college-ic.ca, home.oisc.gov.uk, mara.gov.au).

**Rationale:** CPA s.49 requires "a notice to that effect" before purchase for limitation of liability. The disclaimer also satisfies the NZ and Canada expectation that information services clearly state they are not providing regulated immigration advice.

**Consequences:**
- Disclaimer must appear on member content pages and at checkout/payment confirmation
- Country-specific regulator links should be embedded in destination-specific guides
- Copy must be in plain language (CPA s.22) — no legal jargon

---

## ADR-003: Monitor SA White Paper process

**Date:** 2026-05-03  
**Status:** Active watch

**Context:** The SA DHA 2025/2026 White Paper proposes re-introducing mandatory registration for immigration practitioners. If enacted, it would be the first regulation of SA immigration advisers since s.46 was repealed in 2014.

**Decision:** Check DHA White Paper status in Q4 2026. No action required until enacted.

**Rationale:** The proposed scope targets practitioners who *represent clients in applications* — an information-only product like Jobabroad falls outside this scope. However, the final Act text may differ from the White Paper, so monitoring is warranted.

**Consequences:** Set calendar reminder Q4 2026. If enacted, assess whether any registration requirement captures information products before continuing to operate.

---

## ADR-004: Two-layer member content architecture (Guide + Reference)

**Date:** 2026-05-03  
**Status:** Confirmed

**Context:** Vault-builder research produces deep entity graphs (entity pages, relationship edges, source citations). The question was how to present this to a paying subscriber — as a raw wiki, a PDF, or something else.

**Decision:** Implement two content layers delivered via `app/members/[token]/page.tsx`:

1. **Guide layer** — a curated 6-section narrative per profession category answering the 5 core questions (destination options, documents, costs, visa routes, scam flags, contacts) in plain language. Sourced from `lib/pathway-content.ts`. This is what the subscriber sees first.

2. **Reference layer** — entity detail pages (NMC, Health & Care Worker Visa, Pulse Staffing, etc.) built from vault notes and stored in Supabase. Linked from the guide. Each page: frontmatter summary, body, connections list, source links.

**Search:** pgvector semantic search (Supabase) across all entity content — not client-side static search.

**Format:** Structured Next.js page, not PDF. Enables live updates when visa rules change without reissuing the product.

**Rationale:** signaltrace-site was evaluated as a reference architecture. Its entity-graph model and D3 relationship visualisation are worth adopting for the reference layer. However, signaltrace targets researchers; Jobabroad subscribers are anxious first-time movers who need a narrative guide first. PDF is a one-shot snapshot — unsuitable for a product where policy changes frequently (e.g. UK care worker route closed mid-2025).

**Consequences:**
- Build sequence: nursing vault → guide narrative → Supabase schema → entity ingestion → member page
- Supabase schema needs: `entities`, `entity_connections`, `guides`, `members` (token-gated RLS)
- PDF export is deferred — nice-to-have, not MVP
- signaltrace Supabase integration was evaluated but not yet implemented there; Jobabroad implements it from scratch
- D3 relationship graph (signaltrace pattern) is a candidate for the reference layer entity pages — deferred to post-MVP

---

## ADR-005: Content pipeline — Research → Synthesis → Search

**Date:** 2026-05-03  
**Status:** Confirmed

**Context:** Needed a clear, repeatable workflow for turning vault-builder research into subscriber-facing content and searchable knowledge.

**Decision:** Three sequential phases per profession category:

**Phase 1 — Research corpus (vault-builder wikis)**
Machine-readable entity notes with frontmatter, evidence strength, source citations, and relationship edges. Stored in `~/zoot/wiki-builds/work-abroad-web/`. Never shown directly to subscribers. This is the source of truth — verifiable and updatable independently of what subscribers see.

**Phase 2 — Synthesis (guide writing)**
A human-readable document written *from* the vault. Strips all schema structure. Answers the 6 sections in plain SA English. Stored as `docs/guides/<category>.md`, then ingested to Supabase `guides` table. This is what the subscriber reads first.

**Phase 3 — Vector search (Supabase pgvector)**
Both the guide sections and the raw entity notes are embedded. Handles long-tail questions the guide doesn't explicitly answer — e.g. "Is Global Nurse Force legit?", "Does Australia recognise ICU nursing differently?". The guide covers the 80% journey; semantic search covers the edge questions without having to anticipate every one upfront.

**Pipeline:**
```
vault-builder wikis → human synthesis → guide doc → Supabase (guide + entities + embeddings) → member page (guide view + semantic search)
```

**Update workflow:** The vault is never deleted. When policy changes (e.g. a new visa salary threshold), re-read the relevant entity note, update the guide section, re-embed. The vault is how the guide stays current.

**Rationale:** Keeps research, presentation, and retrieval as independent concerns. Vault quality is not constrained by what looks good in a guide; guide quality is not constrained by search indexing requirements.

**Consequences:**
- Vault notes must remain schema-compliant — they are the update source, not just an archive
- Guide writing is a deliberate synthesis step, not an auto-export of vault content
- Both guide sections and entity notes need embeddings — two ingestion jobs, not one
- Content updates touch vault first, guide second, embeddings third

---

## ADR-006: Auto-evolving corpus — human-in-the-loop gap research

**Date:** 2026-05-03  
**Status:** Confirmed

**Context:** Subscribers will ask questions the current corpus can't answer clearly. Rather than returning a weak answer and losing the signal, we capture the gap, enrich it, and use it to drive vault-builder research — then notify the subscriber when the corpus is updated.

**Decision:** Implement a 4-stage human-in-the-loop feedback loop:

**Stage 1 — Gap detection**
When a subscriber's search returns a best pgvector match below a confidence threshold (initial: 0.75 cosine similarity), log the question to a `questions` table with `status: pending`. The member still receives the closest available answer; the gap is silently captured.

**Stage 2 — Question enrichment (automated)**
A nightly job passes each pending question through Claude with the member's category context, producing a clean, researchable vault-builder seed. Raw "what about ICU?" becomes "ICU/critical care specialisation — does AHPRA registration in Australia differ from general nursing? Are there additional competency assessments?". The enriched question and a suggested vault-builder prompt are written back to the `questions` row.

**Stage 3 — Research & corpus update (human-approved)**
Admin view surfaces pending enriched questions ranked by frequency. John reviews, confirms the gap is real, runs vault-builder with the generated seed. After vault update: guide section updated, entities re-embedded, question marked `resolved`.

**Stage 4 — Subscriber notification**
WhatsApp message to the member: "We've updated the guide to cover [topic] — check your link." Natural fit with the existing channel.

**Rationale:** Full automation of vault-builder triggering is deferred (Phase 2). Research runs take 20–40 min and should reflect a human judgement call that the gap is genuine and worth the investment. The enrichment step is automated because raw subscriber questions are too noisy to feed directly to vault-builder.

**Supabase schema:**
```sql
create table questions (
  id              uuid primary key default gen_random_uuid(),
  member_id       uuid references members(id),
  category        text not null,
  raw_question    text not null,
  enriched_question text,
  similarity_score  float,
  best_match_entity_id uuid references entities(id),
  status          text default 'pending', -- pending | researching | resolved
  vault_prompt    text,
  created_at      timestamptz default now(),
  resolved_at     timestamptz,
  notified_at     timestamptz
);
```

**Consequences:**
- Similarity threshold of 0.75 is a starting point — calibrate after seeing real queries
- The `questions` table becomes a ranked research roadmap: most-asked unanswered questions drive what gets built next
- Full automation (vault-builder triggered without John's approval) is Phase 2 once threshold calibration is stable
- Admin view needed: list pending questions, frequency count, enriched seed, one-click "mark researching"
