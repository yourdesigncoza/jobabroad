# Outreach archive — removed recruiter listings

Recruiters that were once listed on `/recruiters` but have been removed at the
company's request or because they no longer serve South African candidates.
Profiles are preserved here so the research is not lost and the listing can be
restored quickly if circumstances change.

---

## TravelBud — removed 2026-05-14

**Reason:** TravelBud responded to our courtesy-listing email and asked not to be
mentioned. Verbatim:

> "Thanks for your email. TravelBud Holdings is no longer in operation, as we
> have incorporated into the USA as an LLC. We're still listed as our Cape Town
> office on Google for now, but working on getting that removed. We unfortunately
> no longer accept South African candidates, so it would be best if you could
> not mention us, as it would cause confusion."

**Action taken:** removed from `lib/outreach-data.ts` (public `/recruiters` page)
and from the live table in `docs/outreach-contacts.md`. No scraped vault data
existed for TravelBud — the profile below was the only stored data, hand-added
from a manual web lookup, never sourced from a wiki-builds vault.

**Do not re-add** unless TravelBud confirms they again accept South African
candidates.

### Preserved profile (as it appeared in `lib/outreach-data.ts`)

```ts
{
  name: "Travelbud",
  categories: ["TEFL"],
  type: "TEFL placement agency",
  destinations: ["South Korea", "Vietnam", "Thailand", "Japan", "Cambodia", "Myanmar", "Costa Rica"],
  website: "https://www.travelbud.com/",
  email: "info@travelbud.com",
  phone: "+27 21 300 1843",
  evidence: "confirmed",
  notes: "SA-domiciled TEFL placement agency (Cape Town office; also US/UK numbers) operating since 2013. 2,400+ teacher placements across Asia and Costa Rica. End-to-end support: in-country induction, accommodation help, ongoing in-region staff. Charges a programme fee; verify scope and CIPC registration before recommending.",
}
```

Source notes captured during research: `https://www.travelbud.com/`,
`https://info.travelbud.com/`, `travelbud.com/contact-us/`. The outreach email
sent to them is preserved at `scripts/outreach-drafts/bodies/25-travelbud.txt`.
</content>
</invoke>
