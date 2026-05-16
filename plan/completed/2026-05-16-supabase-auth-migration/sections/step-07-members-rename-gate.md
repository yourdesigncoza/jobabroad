---
step: 07
title: Rename /members/[token] → /members/[category] + per-page session gate
status: done
depends-on: [01, 03]
module: app/members
---

# Step 07 — Rename /members/[token] → /members/[category] + session gate

## Objective

Move the existing token-gated guide pages to the new session-gated category route, keeping the existing pathway content rendering intact. Gate access by `profile.category === params.category`; show a 403 with locked-category copy on mismatch.

## Architecture context

- Existing tree:
  ```
  app/members/[token]/
    page.tsx              # token lookup, accessed_at stamp, renders guide
    assessment/page.tsx   # token gate, renders AssessmentWizard
  ```
- Existing code at `app/members/[token]/page.tsx:24-28` queries `member_tokens` and stamps `accessed_at`. All of that goes away.
- `lib/pathway-content.ts` reads `content/pathways/{category}.md` and returns sanitised HTML + TOC. Keep this — only the gate changes.
- `app/members/[token]/page.tsx` shows comms WhatsApp CTAs in the layout (e.g. "Coming soon" ping). Those WhatsApp links must survive the rename.
- `lib/categories.ts` `CATEGORIES` array is the source of truth for valid category ids.

## Files to create

### `app/members/[category]/page.tsx`

```tsx
import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CATEGORIES } from '@/lib/categories';
import { loadPathway } from '@/lib/pathway-content';
// + existing imports for TableOfContents, StickyNav, etc.

export default async function MemberCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!CATEGORIES.some((c) => c.id === category)) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/members/${category}`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('category, name')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    // Race: trigger hasn't fired yet. Step 08 has a skeleton; here we just bounce to dashboard.
    redirect('/dashboard');
  }

  if (profile.category !== category) {
    return (
      <main /* … brand colours … */>
        <h1>Different category access</h1>
        <p>
          Your account is for the <strong>{labelOf(profile.category)}</strong> guide.
          Access to other guides is not available.
        </p>
        <a href={`/members/${profile.category}`}>Go to your guide →</a>
        <a href="/dashboard">Back to dashboard</a>
      </main>
    );
  }

  const pathway = await loadPathway(category);
  if (!pathway) return <ComingSoonView category={category} />;

  // Render existing two-column layout (TOC + article).
}
```

### `app/members/[category]/assessment/page.tsx`

Same gate pattern (session → profile → category match), then renders the existing `AssessmentWizard` for `params.category`.

### `app/members/[category]/layout.tsx` *(optional, for DRY)*

If both `page.tsx` and `assessment/page.tsx` share the gating code, extract a shared `requireCategoryAccess(category)` helper into `lib/auth-guards.ts` rather than a layout (layouts don't naturally short-circuit with redirects + 403 view).

### `lib/auth-guards.ts`

```ts
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function requireSession(returnTo: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return { supabase, user };
}

export async function requireProfile(returnTo: string) {
  const { supabase, user } = await requireSession(returnTo);
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, name, phone, category')
    .eq('user_id', user.id)
    .single();
  return { supabase, user, profile };
}
```

Use `requireProfile` in `app/members/[category]/page.tsx`, `app/members/[category]/assessment/page.tsx`, and `app/dashboard/page.tsx` (Step 08).

## Files to delete

- `app/members/[token]/page.tsx`
- `app/members/[token]/assessment/page.tsx`
- The whole `app/members/[token]/` directory.

## Files to modify

None outside the moved files.

## Pattern context

- WhatsApp comms inside the members area stay (`StickyNav`, "Coming soon" ping, lost-link resend on `SiteFooter`). The "lost link resend" copy might need a refresh — note for Step 11, not here.
- All external links in rendered markdown already get `target="_blank" rel="noopener noreferrer"` via the custom marked renderer in `lib/pathway-content.ts` — verify untouched.

## Risk context

- **R4 (Playwright):** `tests/member-page.spec.ts` hard-codes the UUID token URLs (per `CLAUDE.md` "Test tokens"). Step 14 rewrites it; do not delete the file here.
- The internal links inside `app/dashboard/page.tsx` (Step 08), `SiteFooter` "lost link resend", and any sitemap entries must all switch from `/members/[token]` to `/members/[category]`.
- `app/sitemap.ts` likely lists `/members/[token]` paths — should it list `/members/[category]` instead? Probably **not** (gated pages shouldn't appear in sitemap). Verify and exclude.

## Gemini-noted considerations

- 403 copy for mismatch uses locked-category language (Gemini new idea): "Your account is for the {profile.category} guide. Access to other guides is not available."
- Defence-in-depth: page-level `getUser()` check stays even after middleware (Step 09) handles redirects — middleware can be misconfigured.

## Done when

- `app/members/[token]/` no longer exists.
- `app/members/[category]/page.tsx` and `.../assessment/page.tsx` exist and use `requireProfile()`.
- Unsigned-in user hitting `/members/healthcare` is redirected to `/login?next=/members/healthcare`.
- Signed-in user with `profile.category === 'healthcare'` sees the healthcare guide.
- Signed-in user with `profile.category === 'teaching'` hitting `/members/healthcare` sees the 403 locked-category view with links back.
- Hitting `/members/not-a-real-category` returns a 404.
- `npm run lint` + `npm run build` pass.
