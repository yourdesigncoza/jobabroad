# WhatsApp Notes

A growing log of inbound WhatsApp enquiries, the replies we sent, and reusable patterns. The end goal is a structured corpus an AI assistant can draw on to handle first-touch WhatsApp triage automatically.

## House rules for every reply

1. **No specifics.** Never name recruiters, agencies, employers, hotels, cruise lines, schools, salary ranges, visa fees, or country-by-country requirements. All of that lives behind the paid tier.
2. **Steer to the matching category.** Identify which jobabroad.co.za category fits the enquiry and point them there. The free pathway guide unlocks after they register.
3. **Never mention the R495 paid tier upfront.** The upsell happens after they register, complete the guide, and run the eligibility assessment. WhatsApp replies are top-of-funnel.
4. **One qualifying follow-up question per reply.** Keeps the conversation moving and gives us data for the contact's profile.
5. **Anonymous voice.** Always "we", never "John" or any individual.

## Reply shape

```
Hi! [acknowledge their question in one line]
[name the matching route categories — categories only, no employer/country specifics]
[link them to jobabroad.co.za or the specific category page; remind them the guide opens after registering]

[ONE follow-up question]
```

## Categories (canonical list)

`accounting`, `au-pair`, `engineering`, `farming`, `healthcare`, `hospitality`, `it-tech`, `seasonal`, `teaching`, `tefl`, `trades`

## Files

- `contacts.md` — registry of every contact (phone, first message date, category interest, status)
- `conversations/<phone>.md` — full thread per contact (inbound + our replies + status notes)
- `qa-library.md` — reusable question-shape → reply-pattern → follow-up-question library, tagged by category. This is what the future AI assistant trains/grounds on.

## Filename convention

Phone-only, no `+`, no spaces: `27739480122.md` (matches `wa.me/` URL format).

## Pattern ID convention (qa-library.md)

Every `##` section in `qa-library.md` must include a stable ID line directly under the heading:

```markdown
## matric-only, broad overseas enquiry

**ID:** pat_matric_first_touch

**Question shapes**
- ...
```

- **The slug (heading text) can change. The ID cannot.** Conversation logs and the side-car tool reference patterns by `pat_<slug>`, not by the heading.
- Choose a short, descriptive snake_case slug after the `pat_` prefix.
- The side-car tool's "Add to Library" button auto-generates IDs from kebab-cased names — review and tighten if needed.
- Sections without `**ID:**` are skipped by the parser (and a warning is logged), so unmigrated entries silently disappear from match candidates.
