---
step: 10
title: Supabase Auth dashboard config (manual)
status: done
depends-on: [03]
module: ops
---

# Step 10 — Supabase Auth dashboard configuration

## Objective

Manual configuration in the Supabase dashboard (non-code). Enables email confirmations, sets redirect URLs to match the new routes, customises the confirmation + recovery email templates.

## Architecture context

- Supabase project URL: `https://hwqlvrabuhcottyzaaff.supabase.co` (from CLAUDE.md env).
- The Auth section of the dashboard is at `https://supabase.com/dashboard/project/hwqlvrabuhcottyzaaff/auth/users` (or wherever the project lives).
- This step has no code deliverables — only checklists and copy.

## Checklist

### 1. Enable email confirmations

`Auth → Providers → Email → Confirm email` = ON.

This makes `supabase.auth.signUp` create the user in an unconfirmed state and send a confirmation email. Without this, Step 04's `/register` → `/auth/confirm-email` redirect makes no sense.

### 2. Redirect URLs

`Auth → URL Configuration → Redirect URLs`. Add the following (one per line):

```
http://localhost:3000/auth/callback
https://jobabroad.co.za/auth/callback
```

If Vercel preview deployments need to work for testers, also add:

```
https://*.vercel.app/auth/callback
```

`Site URL` should be set to `https://jobabroad.co.za` for production.

### 3. Email templates

`Auth → Email Templates`. Update the **Confirm signup** template:

**Subject:** `Confirm your Jobabroad account`

**Body (HTML, replace default):**

```html
<h2>Welcome to Jobabroad</h2>
<p>Confirm your email to unlock your {{ .CategoryLabel | default "pathway" }} guide.</p>
<p><a href="{{ .ConfirmationURL }}">Confirm my email →</a></p>
<p>If the button doesn't work, paste this link into your browser:<br>{{ .ConfirmationURL }}</p>
<p>If you didn't register, you can ignore this email.</p>
```

Note: Supabase templates don't natively expose user metadata in the body — `{{ .CategoryLabel }}` is illustrative. If it's not available, fall back to "your pathway guide". Verify what variables are supported in the current Supabase docs.

Update the **Reset password** template:

**Subject:** `Reset your Jobabroad password`

**Body (HTML):**

```html
<h2>Password reset</h2>
<p>Click below to set a new password.</p>
<p><a href="{{ .ConfirmationURL }}">Reset my password →</a></p>
<p>If the button doesn't work: {{ .ConfirmationURL }}</p>
<p>If you didn't request a reset, ignore this email — your password stays the same.</p>
```

### 4. Auth provider settings (sanity)

- `Auth → Providers → Email → Secure email change` = ON.
- `Auth → Providers → Email → Secure password change` = ON.
- `Auth → Rate Limits` — accept defaults (60s resend, 3 signups/hour per IP, etc.).
- `Auth → Settings → Minimum password length` — leave at the Supabase default (6) unless we want to bump to 8 (Step 04 Zod schema enforces 8 anyway).

### 5. Optional: SMTP

Supabase's built-in email sender is rate-limited (a few sends per hour). Fine for dev and early launch. If signup volume picks up, configure custom SMTP under `Auth → SMTP Settings`. **Defer this** — memory `project_email_automation_options` notes Resend/Postmark as the eventual stack, not for this plan.

## Files to create

None.

## Files to modify

None in the repo. Document the applied settings in `docs/Work Abroad MVP Plan.md` or a new `docs/supabase-auth-config.md` if useful for the next person.

## Risk context

- Missing redirect URL → confirmation links land on `https://supabase.com/auth-redirect-failed` instead of `/auth/callback`. Test the email-confirmation flow end-to-end immediately after configuring.
- Forgetting to enable "Confirm email" → users land on `/auth/confirm-email` despite already being confirmed at signup time → the page bounce-to-dashboard guard handles it but the UX is jarring.
- SMTP rate limits on Supabase's built-in sender → users see "Resend" failures during testing. Stagger test signups.

## Gemini-noted considerations

- Custom email template copy is reader-friendly — Gemini emphasised UX clarity for the confirm flow.

## Done when

- Email confirmations are ON in the dashboard.
- Redirect URLs include localhost + production + vercel preview.
- Confirmation + reset templates are updated.
- A real test signup from `localhost:3000/register` results in: (a) email arrives within ~30s, (b) clicking the link lands on `/auth/callback` → `/dashboard`, (c) `email_confirmed_at` on the auth.users row is no longer null.
