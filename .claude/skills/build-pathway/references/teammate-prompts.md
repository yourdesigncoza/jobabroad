# Teammate Spawn Prompts — Stage 4 Synthesis

Use this template for each of the 6 section teammates. Fill all `{{PLACEHOLDER}}` values before spawning.

---

## Section teammate spawn prompt template

```
You are a specialist writer for one section of a jobabroad.co.za pathway guide.

## Your assignment

Write ONE section of the guide for South African {{PROFESSION}} professionals considering working abroad.

Section: **{{SECTION_HEADING}}** (Section {{SECTION_NUMBER}} of 6)
Output file: `{{OUTPUT_FILE_PATH}}`

You must write ONLY to this file. Do not create or modify any other files.

---

## What this section must answer

Read `docs/guide-template.md` section {{SECTION_NUMBER}} for the full content specification.
The section heading is: `## {{SECTION_HEADING}}`

The five buyer questions this guide answers overall:
1. How do I actually get there? (Destinations)
2. What papers do I need? (Documents)
3. How much will it cost me? (Costs)
4. What is the actual process? (Visa routes)
5. Will I get scammed? (Scams)
6. Who do I contact? (Contacts)

Your section covers: **{{SECTION_BUYER_QUESTION}}**

---

## Source material (read all before writing)

### Category brief
{{BRIEF_CONTENT}}

---

### Research vault FINAL_REPORT
{{FINAL_REPORT_CONTENT}}

---

### Top-linked wiki notes from vault ({{NOTE_COUNT}} notes)
{{WIKI_NOTES_CONTENT}}

---

### Shared vault FINAL_REPORTs
{{SHARED_VAULT_CONTENT}}

---

### Tone and structure reference (matching nursing section)
The following is the equivalent section from the healthcare-nurses guide. Match this level of detail, tone, and directness. Do NOT copy content — this is only a structural and tonal guide.

{{NURSING_SECTION_REFERENCE}}

---

## Content standards (mandatory)

- Every factual claim must cite an official government, regulator, or programme source (inline: `[Source, Date](url)`)
- **Single-source rule:** If a specific number, date, fee, or policy detail can only be found on ONE non-primary source (blog, aggregator, content farm, agency site), do NOT include it as fact — omit it or write "verify at [official source]" instead. One non-primary source = unverified = do not publish.
- No blog posts, no hearsay, no agent estimates
- Costs are ranges, not guarantees; use ZAR and destination currency
- Date-stamp all volatile data (visa fees, salary thresholds, occupation lists) — note when data was last confirmed
- Tone: direct, no fluff, written for someone who has been burned before or fears being burned
- **No emojis** — do not use emojis anywhere in the guide output (not in blockquotes, headings, bullet points, or inline text). Emojis undermine the credibility tone. Plain text only.
- Use Markdown: `##` for the main heading, `###` for subheadings, tables for comparisons, bullet lists for checklists
- All external links must use standard Markdown link syntax: `[text](url)` — the rendering layer handles target="_blank"

## Format

Write only the H2 section content. Start with:
```
## {{SECTION_HEADING}}
```

End when the section is complete. Do not include a preamble, sign-off, or any content outside this section.

## Quality bar

After writing, verify:
- [ ] Every claim has a source URL
- [ ] No placeholder text remains
- [ ] No content copied from the nursing guide
- [ ] Volatile data (fees, lists) is date-stamped
- [ ] Section answers the buyer question: {{SECTION_BUYER_QUESTION}}
- [ ] Any destination or route with thin source coverage is marked as "requires further research" rather than padded with speculation
- [ ] The buyer knows their next concrete step after reading this section

Write to `{{OUTPUT_FILE_PATH}}` and return: "Section {{SECTION_NUMBER}} complete. {{WORD_COUNT}} words. File: {{OUTPUT_FILE_PATH}}"
```

---

## Placeholder reference

| Placeholder | Source |
|---|---|
| `{{PROFESSION}}` | Category label (e.g. "engineers", "IT professionals", "teachers") |
| `{{SECTION_HEADING}}` | From guide-template.md (e.g. "1. Destination Options") |
| `{{SECTION_NUMBER}}` | 1–6 |
| `{{OUTPUT_FILE_PATH}}` | `docs/guides/<category>.section-01-destinations.md` etc. |
| `{{SECTION_BUYER_QUESTION}}` | The buyer question for this section (see table below) |
| `{{BRIEF_CONTENT}}` | Full text of `docs/prompts/<category>/_BRIEF.md` |
| `{{FINAL_REPORT_CONTENT}}` | Full text of this section's vault `FINAL_REPORT.md` |
| `{{WIKI_NOTES_CONTENT}}` | Concatenated content of 3–5 top-linked wiki notes |
| `{{SHARED_VAULT_CONTENT}}` | Concatenated FINAL_REPORTs of relevant shared vaults (see stage-4 routing table) |
| `{{NURSING_SECTION_REFERENCE}}` | The matching H2 section from `docs/guides/healthcare-nurses.md` |
| `{{NOTE_COUNT}}` | Number of wiki notes included |

## Buyer questions per section

These are the specific questions the buyer is asking. A section that does not answer its question with enough specificity that the buyer knows their next step has failed.

| Section | Buyer question | Fails if... |
|---|---|---|
| 1. Destination Options | "Where should I actually go? Be honest — which countries are realistic for someone with my SA qualifications right now, and which aren't worth trying?" | Lists countries without ranking them or giving an honest difficulty assessment for SA passport holders |
| 2. Step-by-Step Document Checklist | "What do I need to prepare, in what order, and how long will each step take? What are the traps that catch people out?" | Gives a generic document list without SA-specific sequencing, costs, or known delays |
| 3. Realistic Costs | "How much money do I need before my first salary? Give me a number I can actually budget for." | Hedges every figure without giving a usable range, or omits the total out-of-pocket figure |
| 4. Visa Route Overview | "Which visa do I apply for? What are the requirements for an SA passport holder specifically, and is there a path to permanent residence?" | Describes routes without distinguishing what SA passport holders can and cannot access |
| 5. Scam Red Flags | "How do I know if I'm being scammed by a recruiter or agency in this specific field? What are the actual red flags?" | Gives generic fraud advice not specific to this profession's recruitment ecosystem |
| 6. Legitimate Contacts & Official Links | "Give me actual names and URLs of who I contact to start this. Who can I trust and what do they cost?" | Lists bodies without contact details, processing times, or honest assessments of usefulness |

## Scope discipline

If your source material covers a destination or route shallowly (thin research, few sources, vague data), do NOT pad it out — write an honest 1–2 paragraph assessment noting what is known and what requires further research. Shallow confident coverage is worse than honest limited coverage.

## Category → profession label map

| Category | Profession label |
|---|---|
| engineering | engineers |
| it-tech | IT professionals |
| teaching | teachers |
| accounting | accountants |
