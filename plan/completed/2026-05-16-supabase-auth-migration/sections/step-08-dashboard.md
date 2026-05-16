---
step: 08
title: /dashboard page with graceful null-profile handling
status: done
depends-on: [01, 03, 07]
module: app/dashboard
---

# Step 08 — /dashboard page

## Objective

Authenticated landing page. Greets the user by name, shows their category, links to: their pathway guide, their assessment, recruiters page, scam-warnings page. Logout button. Handles the rare race where `auth.users` exists but `profiles` row hasn't propagated yet (skeleton + meta-refresh).

## Architecture context

- Existing pages that the dashboard links to:
  - `/members/[category]` — Step 07
  - `/members/[category]/assessment` — Step 07
  - `/recruiters` — public, exists
  - `/scam-warnings` — public, exists
- `requireProfile()` helper from Step 07 returns `{ supabase, user, profile }`.
- Brand colours inlined. Layout consistent with the rest of the site.
- WhatsApp comms button is in `SiteFooter` (universal); no need to add another here.

## Files to create

### `app/dashboard/page.tsx`

```tsx
import Link from 'next/link';
import { requireSession } from '@/lib/auth-guards';
import { CATEGORIES } from '@/lib/categories';

export const dynamic = 'force-dynamic'; // always reflect session state

export default async function DashboardPage() {
  const { supabase, user } = await requireSession('/dashboard');

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, category')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    // Race: trigger hasn't fired or replication lag. Show skeleton + meta-refresh.
    return <ProfilePendingSkeleton />;
  }

  const categoryLabel = CATEGORIES.find((c) => c.id === profile.category)?.label ?? profile.category;

  return (
    <main /* … brand bg … */>
      <h1>Hi {profile.name}</h1>
      <p>Your category: <strong>{categoryLabel}</strong></p>

      <section /* cards grid */>
        <Card href={`/members/${profile.category}`} title={`${categoryLabel} guide`} body="Field-tested pathway: countries, documents, costs, visa routes." />
        <Card href={`/members/${profile.category}/assessment`} title="Eligibility assessment" body="Find out what blockers stand between you and a job abroad." />
        <Card href="/recruiters" title="Vetted recruiters" body="Browse legitimate recruiters and placement agencies." />
        <Card href="/scam-warnings" title="Scam warnings" body="Patterns to avoid — protect yourself before you pay anyone." />
      </section>

      <form action="/logout" method="POST">
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}

function ProfilePendingSkeleton() {
  return (
    <main>
      <meta httpEquiv="refresh" content="2" />
      <h1>Setting up your account…</h1>
      <p>Just a moment while we finalise your profile.</p>
    </main>
  );
}
```

### `components/DashboardCard.tsx` *(optional — inline if not reused)*

If the `<Card />` pattern only lives here, inline it. If it shows up in other places later, extract.

## Files to modify

None.

## Pattern context

- `dynamic = 'force-dynamic'` ensures fresh session/profile per request (the dashboard must never be cached).
- Logout via `<form action="/logout" method="POST">` — simplest, works without JS, calls the Step 05 route handler.
- The dashboard link to `/members/[category]/assessment` uses the user's locked category, so users never see a category selector here.
- WhatsApp comms link is in `SiteFooter` (universal) and `StickyNav` (sticky header on member pages). The dashboard doesn't need its own.

## Risk context

- **R1 (race):** Skeleton + meta-refresh handles trigger-propagation race. After 2-3 refreshes, profile should exist. If not, something is genuinely wrong — surface a "contact us via WhatsApp" link as a fallback inside the skeleton.
- Logout button: must be a POST (browsers preload GET links; a GET /logout would log out every visitor on hover-preview).
- Cookie-aware Supabase client reads cookies on each request; no manual cache invalidation needed when the user changes anywhere.

## Gemini-noted considerations

- Graceful null-profile handling (Gemini new idea, incorporated): meta-refresh skeleton instead of 500 error.
- WhatsApp button NOT removed from the layout — comms-only role preserved.

## Done when

- `/dashboard` redirects unsigned-in users to `/login?next=/dashboard` (handled by `requireSession`).
- Confirmed user sees: greeting with their name, category badge, four cards, logout button.
- Clicking the guide card lands on `/members/[their-category]`.
- Clicking the assessment card lands on `/members/[their-category]/assessment`.
- Clicking logout returns user to `/` with no session.
- If the trigger somehow didn't fire (delete the profile row manually mid-test), the page shows the skeleton with auto-refresh.
- `npm run lint` + `npm run build` pass.
