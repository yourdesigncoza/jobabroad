# Continue tomorrow — 2026-05-13 session handoff

## ⚠️ NEXT (added 2026-05-14) — Engineering pathway: Eligibility Check + email extractions

`content/pathways/engineering.md` is **published** (full `/build-pathway engineering` run complete,
publish gate passed). Two derivatives still outstanding for engineering — do these next:

1. **Eligibility Check** — build `lib/assessments/steps/engineering.ts`, modelled on the existing
   step files (healthcare/teaching/tefl/au-pair). Engineering is published but has no assessment yet,
   same gap trades had (see follow-up #4 below).
2. **Email extractions** — run the Google `email address for <domain>` first-pass technique against
   the engineering recruiter/regulator contacts before falling back to contact forms, then queue
   `gog` Gmail drafts.

## What shipped today

- **TEFL pathway** — guide published (`content/pathways/tefl.md`), eligibility check live (`lib/assessments/steps/tefl.ts`), 9 recruiters on `/recruiters`, 6 scam patterns on `/scam-warnings`
- **Au-pair pathway** — guide published (`content/pathways/au-pair.md`), eligibility check live (`lib/assessments/steps/au-pair.ts`), 8 sponsors on `/recruiters`, 9 scam patterns on `/scam-warnings`

Two pathways shipped end-to-end including outreach derivatives.

## Open follow-ups (do these first)

### 1. Send the 4 pending au-pair Gmail drafts
Review and send from your Gmail Drafts (created via `gog` batch 4):

| # | Recipient | Email |
|---|---|---|
| 29 | Cultural Care Au Pair | `capetown@culturalcare.com` |
| 30 | Au Pair in America / African Ambassadors | `info@aupairinamerica.co.za` |
| 31 | AuPairCare | `customercare@aupaircare.com` |
| 35 | OVC South Africa | `Admin1@ovc.co.za` |

Pace 3–5/day per the warmup rules in `docs/outreach-emails.md`.

### 2. Form-only outreach (Google "email address for <domain>" first)
Surface emails before falling back to contact forms:

- **TEFL:** Footprints Recruiting, International TEFL Academy, i-to-i TEFL, Reach to Teach Recruiting
- **Au-pair:** EurAuPair, Go Au Pair, GreatAuPair

Hit rate from earlier batch was 3/3 (Google AI Overview pulls addresses from PDFs/footers/help articles defuddle can't see).

### 3. Watch for TEFL replies
Five TEFL emails sent 2026-05-13 (Korvia, TravelBud, Teach Away, The TEFL Org, CIEE). Auto-replies + substantive responses logged in `docs/outreach-emails.md` status table.

### 4. Trades has no assessment yet
`lib/assessments/steps/` has 7 categories registered (healthcare, teaching, seasonal, farming, hospitality, tefl, au-pair). **Trades is published but missing its assessment** — easy half-hour build using `lib/assessments/steps/trades.ts` modelled on the existing files.

## SEO — verify after committing this session's changes

This session added sitemap, robots, Open Graph tags + image, and JSON-LD structured
data (`lib/site.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`,
plus metadata in `app/layout.tsx` / `page.tsx` / `recruiters` / `scam-warnings`).

Once all changes are committed and deployed, check:

- [ ] `https://jobabroad.co.za/robots.txt` and `/sitemap.xml` resolve in production
- [ ] OG image renders — paste a page URL into the [OpenGraph debugger](https://www.opengraph.xyz/) or share into WhatsApp to confirm the card preview
- [ ] Structured data passes [Google Rich Results Test](https://search.google.com/test/rich-results) against the live homepage
- [ ] Submit `sitemap.xml` in Google Search Console (once the domain is verified there)

## Remaining build-pathway runs

Two categories still to build (`engineering` shipped 2026-05-14):

| Category | Brief | Estimate |
|---|---|---|
| `it-tech` | Ireland CSEP primary; UK / DE / CA secondary; STEM-heavy | ~4–5h wall, ~30 min hands-on |
| `accounting` | SAICA MRA angle; UK ICAEW / AUS CAANZ / CA CPA Canada | ~4–5h wall, ~30 min hands-on |

Each follows the same `/build-pathway <category>` flow used for TEFL and au-pair. Skill already accepts these category names.

**Tip from today's experience:** Two pipelines can run in parallel sessions to halve wall time. Each holds its own context budget.

## Minor cosmetic to-dos

- **CIEE Teach Abroad deep link** — `https://www.ciee.org/go-abroad/teach` now 404s. Their actual teach-abroad path has changed; cosmetic fix in `lib/outreach-data.ts` and `content/pathways/tefl.md` references.

## Project state today

- Working tree clean
- All commits pushed to `origin main` (last 4: `e1eb8de`, `f49f4f5`, `9a212d4`, plus earlier TEFL commits)
- 5h time budget reset at 11:30PM; new budget available

## Reference

- Test tokens listed in `CLAUDE.md` "Testing — Playwright First" section (added healthcare, teaching, seasonal, trades, farming, hospitality)
- TEFL test token: `cb5979fb-c1de-4fbf-b13c-27788a800d8f`
- Au-pair test token: `8559f601-0f33-42bb-8ec5-95443dd124c8`
- Outreach playbook: `docs/outreach-emails.md`
- Recruiter contacts table: `docs/outreach-contacts.md`
