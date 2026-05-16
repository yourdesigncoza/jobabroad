---
step: 11
title: Landing copy strip + CategoryCard reroute + nav additions
status: done
depends-on: [04]
module: components
---

# Step 11 — Landing + nav rewrite

## Objective

Strip R199/PayShap references from landing-page surfaces; route the landing CategoryCard tiles to `/register?category=X` instead of WhatsApp pre-fill; add Login/Register/Dashboard/Logout to nav. Keep all WhatsApp comms buttons unchanged.

## Architecture context

- Files containing R199/PayShap copy (verify with `grep -rn 'R199\|PayShap\|199' app components lib`):
  - `app/page.tsx` — hero + sections
  - `components/StatStrip.tsx`
  - `components/HowItWorks.tsx`
  - `components/FAQ.tsx`
  - `lib/site.ts` — meta description / OG copy
  - `components/SiteFooter.tsx` — "lost link resend" copy ("after paying R199")
  - `lib/whatsapp-templates.ts` — internal; **don't strip** (Step 12 marks file deprecated)
- `components/CategoryCard.tsx` currently builds a `wa.me` link via `buildWhatsAppLink(category, src)`. After this step it should `<Link href={"/register?category=" + id}>` to a Next.js internal route.
- `lib/categories.ts` exports `buildWhatsAppLink` — keep the function (used elsewhere) but remove the import from `CategoryCard`.
- `lib/categories.ts` ids exclude `remote-work` from registration (Step 04 filtering). On the landing page, `remote-work` still appears as a WhatsApp tile per memory `project_remote_work_deferred`. So `CategoryCard` needs to support TWO behaviours: register-route for normal categories, wa.me for `remote-work`.

## Files to modify

### `app/page.tsx`

- Find all "R199", "199", "PayShap" mentions — replace with free-access language.
- Hero CTA: change from "WhatsApp me — get started" (or current copy) to "Register free — pick your category".
- Sub-CTA: keep a smaller "Or chat on WhatsApp" link that opens a wa.me link with no category pre-fill, just "Hi, I have a question" message.
- Anything that says "after payment" should say "after free registration" (e.g. "After registration, we send you a private member link" → "After registration, your guide unlocks immediately").

### `components/StatStrip.tsx`

If it currently has "R199 once-off" or similar pricing copy, replace with a non-price stat or remove that line.

### `components/HowItWorks.tsx`

The 3-4 step "how it works" likely contains:
- "Tap WhatsApp" → "Register free"
- "Pay R199 via PayShap" → "Confirm your email"
- "Receive your unique link" → "Log in to your dashboard"
- "Access your pathway guide" → keep, but route to `/members/[category]` is internal now

Rewrite the step copy to match the new free-registration flow.

### `components/FAQ.tsx`

Look for Q&A about R199, payment, PayShap. Either delete those entries or rewrite as "Is it really free?" → "Yes, registering and accessing your category's guide is free." Note that the future paid 15-min call IS in the roadmap but out of scope here — don't pre-announce.

### `lib/site.ts`

Meta description / OG description likely has "R199 work-abroad guide". Replace with free-registration language. Keep target country examples ("nurses to UK, teachers to Korea") intact.

### `components/SiteFooter.tsx`

The "lost link resend" WhatsApp button can stay but the copy should change: "Lost your link? WhatsApp us" → "Forgot your password? Reset it here" (link to `/forgot-password`). Keep the WhatsApp "Chat" button separate (comms-only).

### `components/CategoryCard.tsx`

Currently:
```tsx
const href = buildWhatsAppLink(category.label, src);
return <a href={href} target="_blank" rel="noopener noreferrer">…</a>;
```

After:
```tsx
import Link from 'next/link';
import { buildWhatsAppLink } from '@/lib/categories';

const isRemoteWork = category.id === 'remote-work';
const href = isRemoteWork
  ? buildWhatsAppLink(category.label, src)
  : `/register?category=${category.id}${src ? `&src=${src}` : ''}`;

return isRemoteWork ? (
  <a href={href} target="_blank" rel="noopener noreferrer" /* … */ >…</a>
) : (
  <Link href={href} /* … */ >…</Link>
);
```

`?src=...` for UTM tracking continues to work — pass through to `/register` where Step 04 doesn't currently capture it, but adding a hidden `src` field in the form is a tiny optional addition (defer if it bloats the diff).

### `components/SiteNav.tsx`

Add nav items based on session state. Use a server-side check via a small server component wrapper, OR pass `user`/`profile` as props from the layout.

Simplest: convert `SiteNav` to a server component that reads `createSupabaseServerClient().auth.getUser()` and renders accordingly.

- Signed out: `Log in` (→ `/login`), `Register` (→ `/register`)
- Signed in: `Dashboard` (→ `/dashboard`), `Log out` (POST form to `/logout`)

Keep the existing "WhatsApp me" button as a secondary CTA in all states.

### `components/MobileNav.tsx`

Mirror `SiteNav` additions for the mobile drawer.

## Files to create

None.

## Pattern context

- Brand tokens inlined as `style={}` — preserve.
- External links rule: WhatsApp comms `a` tags keep `target="_blank" rel="noopener noreferrer"`. Internal Next links (`<Link href="/register">`) do NOT need it.
- Voice anonymous ("we") per memory `project_automation_objective`.

## Risk context

- Easy to miss a hidden R199 reference. Use a grep sweep at the end of this step:
  ```bash
  grep -rn 'R199\|R 199\|PayShap\|payshap\|199.*rand\|once.off' app components lib --include='*.ts' --include='*.tsx' \
    | grep -v whatsapp-templates.ts \
    | grep -v node_modules
  ```
  Output should be empty (whatsapp-templates.ts is excluded because Step 12 marks it deprecated-but-kept).
- `app/page.tsx` reads `searchParams.src` and passes to `buildWhatsAppLink` for UTM tracking. The `?src=` value should flow into `/register?category=X&src=Y` as well so analytics still work.
- SiteNav as a server component means it can't use client-side hooks. If it currently uses any (`useState`, `useEffect`), refactor into a client subcomponent wrapped by the server outer.

## Gemini-noted considerations

- Pre-select category on `/register?category=X` (Gemini agreed): reduces friction.
- 403 copy with locked-category language already handled in Step 07; no change here.

## Done when

- Grep sweep for `R199|PayShap|199.*rand|once.off` returns zero matches in `app/`, `components/`, `lib/` (excluding `whatsapp-templates.ts`).
- Clicking a category tile on `/` routes to `/register?category=X` for all categories except `remote-work` (which still opens WhatsApp).
- `SiteNav` shows Login/Register when signed out, Dashboard/Logout when signed in. Mobile drawer mirrors this.
- `SiteFooter` "lost link" button now routes to `/forgot-password`.
- WhatsApp "Chat" / "WhatsApp me" buttons in header, footer, members-area `StickyNav` still work and still open wa.me links.
- `npm run lint` + `npm run build` pass.
- Visual check: hero copy on `/` mentions free registration, not R199.
