---
step: 12
title: Retire /admin + ADMIN_SECRET + mark whatsapp-templates.ts deprecated
status: done
depends-on: [09]
module: cleanup
---

# Step 12 — Retire dead onboarding code

## Objective

Delete the legacy admin token-generation flow and supporting code. Mark `lib/whatsapp-templates.ts` as future-use only (keep file). Remove `ADMIN_SECRET` from env requirements + docs.

## Architecture context

- Files to delete (verified exist):
  - `app/admin/page.tsx` — token-generation UI
  - `app/api/admin/generate-token/route.ts` — POST endpoint
  - `lib/admin-auth.ts` — `isAdminAuthorized` Basic auth helper
- Files to keep but annotate:
  - `lib/whatsapp-templates.ts` — keep as data; annotate as deprecated for onboarding (future repurpose)
- Documentation to update:
  - `CLAUDE.md` (project root) — remove `ADMIN_SECRET` line from env vars section
  - `.env.example` (if exists)
  - `docs/Work Abroad MVP Plan.md` — update flow description if it references `/admin`

## Files to delete

```bash
rm app/admin/page.tsx
rm app/api/admin/generate-token/route.ts
rm lib/admin-auth.ts
# If app/admin/ is now empty:
rmdir app/admin 2>/dev/null
# If app/api/admin/ is now empty:
rmdir app/api/admin 2>/dev/null
```

## Files to modify

### `lib/whatsapp-templates.ts`

Prepend the file with a header comment:

```ts
/**
 * WhatsApp message templates.
 *
 * STATUS: Retained as data, NOT currently wired into any UI or automation.
 *
 * Originally powered the manual 3-message onboarding drip (qualifier →
 * category pitch → PayShap R199 request). Onboarding was migrated to
 * Supabase Auth on 2026-05-16; see
 * /home/laudes/.claude/projects/-home-laudes-zoot-projects-work-abroad-web/memory/project_whatsapp_repurposed.md
 *
 * Planned re-use: post-assessment nurture, paid-tier upsell (15-min call),
 * re-engagement of registered-but-inactive users.
 *
 * Do not delete. Do not wire back into the onboarding path.
 */
```

### `CLAUDE.md` (in project root)

In the environment variables section, remove the line:
```
ADMIN_SECRET                  # 32-char random string for /admin auth
```

If there's a documented `/admin` workflow elsewhere in `CLAUDE.md`, replace the relevant paragraph with a one-liner: "Self-serve registration via `/register` — see `plan/completed/2026-05-16-supabase-auth-migration/` for the migration history."

### `.env.example` (if it exists)

Remove the `ADMIN_SECRET=` line. Add any new vars (none — Supabase Auth uses existing `NEXT_PUBLIC_SUPABASE_URL` / anon / service role).

### `docs/Work Abroad MVP Plan.md`

If this doc describes the old flow (WhatsApp → PayShap → /admin → token link), add a note at the top:

```
> **Updated 2026-05-16:** Onboarding migrated from WhatsApp/PayShap/token to
> Supabase Auth (email+password, single-category free access). This document
> describes the original MVP flow for historical context; current implementation
> is at `app/register/`, `app/login/`, `app/dashboard/`, `app/members/[category]/`.
```

## Files to create

None.

## Pattern context

- Deletion is safe at this point because Step 09 middleware + Step 04-08 routes provide the full replacement.
- `lib/whatsapp-templates.ts` is referenced ONLY by the (now-deleted) `/admin` page. After this step, `grep -rn whatsapp-templates app components lib` should return zero matches. The file is unreferenced data — that's the intent.

## Risk context

- Verify no other code imports the deleted files: `grep -rn "admin-auth\|generate-token\|/admin'" app components lib --include='*.ts' --include='*.tsx'` should return zero after deletion.
- `ADMIN_SECRET` may be referenced in Vercel env settings — note for the user to remove it from the Vercel dashboard after deploy.
- The `/admin` URL itself will 404 after deletion. Confirm nothing externally links to it (no Google indexing — was behind Basic auth).

## Gemini-noted considerations

- None specific. This is straightforward cleanup.

## Done when

- `app/admin/`, `app/api/admin/`, and `lib/admin-auth.ts` no longer exist.
- `lib/whatsapp-templates.ts` exists with the deprecation header comment.
- `grep -rn "admin-auth\|isAdminAuthorized\|ADMIN_SECRET" app components lib --include='*.ts' --include='*.tsx'` returns zero matches.
- `CLAUDE.md` no longer mentions `ADMIN_SECRET` in env vars.
- `npm run lint` + `npm run build` pass.
- `/admin` URL returns 404 in dev.
- User reminder logged: remove `ADMIN_SECRET` from Vercel project env vars after the next deploy.
