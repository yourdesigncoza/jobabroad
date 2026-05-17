---
step: 12
title: Eager report generation on payment + email + WhatsApp notification
status: blocked
depends: [07, 08]
plan: r495-paid-tier
---

# Step 12: Eager generation on payment + buyer notification

## Objective

When the payment webhook flips `tier='paid'`, kick off PDF generation
**in the background** (don't block the webhook response), email the PDF
to the buyer via Brevo, and send a WhatsApp notification telling them
"your report is ready". By the time the buyer lands on the dashboard,
the report is usually already in their inbox.

## Context

### Architecture

Sequence:
1. Webhook receives success → updates `profiles.tier='paid'` + credits
2. Webhook responds `200 OK` immediately (don't make the provider wait)
3. **Fire-and-forget** background task in the same function:
   - Generate the PDF (step 08 logic, 8-15s)
   - Upload to Supabase Storage
   - Insert `paid_reports` row
   - Send email via Brevo with PDF attached
   - Send WhatsApp notification (mechanism: TBD — see "WhatsApp transport" below)
4. User lands on `/members/[category]/paid` (or `/dashboard`): report is
   typically ready; if not, polling UI catches up.

Vercel default timeout is 300s (Fluid Compute), so the background task
within the same invocation has headroom. Spawn with
`waitUntil(promise)` from `@vercel/functions` so Vercel knows to keep
the function alive after the HTTP response is sent.

### WhatsApp transport — decision deferred

Three viable options (DEFER decision until execution; pick whichever is fastest to wire):

1. **Twilio WhatsApp Business** — easiest API, sandbox for testing, pay-per-message. Need new `TWILIO_*` env vars + an approved sender (Twilio handles Meta approval).
2. **Meta WhatsApp Business Cloud API** — direct from Meta, free tier, but requires Business Manager + approved message templates. More setup.
3. **`wa.me` deep link in the email instead of a real WhatsApp send** — zero infra. Email body includes a "Reply on WhatsApp →" link that opens chat to John's number with a pre-filled message. Not really a notification, but free and instant for John.

Recommend option 3 for v1 (zero infra). If user requirements truly need a programmatic push notification, switch to Twilio at any point — wrap the send behind `lib/whatsapp/notify.ts` so the choice is one-file-changeable.

### Database

No schema changes. `paid_reports` insert happens in step 08's generator.

### Existing Patterns

- Brevo wrapper from step 11 already supports attachments (extended in this step)
- `@vercel/functions` provides `waitUntil` for post-response work

### Risk

- **Background generation failure** silently swallowed: log to console (Vercel captures); if generation fails, user requesting the report later triggers a fresh attempt (step 08's generator is idempotent on `paid_reports` upsert).
- **Webhook latency**: spawning generation in the same invocation could conceptually delay the 200 response. Solution: use `waitUntil(generateAndNotify(userId))` AFTER `return new Response('ok')`. The function keeps running but the HTTP response went out.
- **Double-fire on webhook retry**: if provider retries webhook (network blip), idempotency check in step 07 returns early — no duplicate report generation.
- **WhatsApp link tracking risk** (option 3): same Brevo tracking that broke OTP links earlier could wrap the wa.me URL. Disable Brevo click-tracking globally (already done during step-10 of auth migration plan).

## Implementation

1. Extend `lib/email/brevo.ts` to support attachments (per original step 12 plan):
```ts
export async function sendEmail(opts: {
  from: { email: string; name: string };
  to: Array<{ email: string; name?: string }>;
  replyTo?: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  attachment?: Array<{ name: string; content: string /* base64 */ }>;
}): Promise<void> { … }
```

2. Create `lib/notifications/report-ready.ts`:
```ts
import { sendEmail } from '@/lib/email/brevo';
import { generateReport } from '@/lib/reports/generator';

export async function generateAndNotify(userId: string): Promise<void> {
  try {
    const { pdfBuffer, signedUrl, profile, user, categoryLabel } = await generateReport(userId);

    // 1. Email with PDF attached
    await sendEmail({
      from: { email: 'no-reply@jobabroad.co.za', name: 'Jobabroad' },
      to:   [{ email: user.email!, name: profile.name }],
      subject: `Your full ${categoryLabel} assessment report`,
      htmlContent: emailTemplate({ name: profile.name, categoryLabel, dashboardUrl: 'https://jobabroad.co.za/dashboard', whatsappUrl: whatsAppDeepLink(profile, categoryLabel) }),
      attachment: [{ name: `jobabroad-${categoryLabel.toLowerCase()}-report.pdf`, content: pdfBuffer.toString('base64') }],
    });

    // 2. WhatsApp deep-link notification (v1: include in email; future: real push)
    //    For v1 we lean on email + the dashboard's "Open WhatsApp" button.
    //    See "WhatsApp transport" section above for swap path.
  } catch (e) {
    console.error('[report-ready] generation or notification failed', { userId, e });
    // Swallow — user can retry from dashboard later.
  }
}

function whatsAppDeepLink(profile: { name: string }, categoryLabel: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const text = encodeURIComponent(`Hi, I'm ${profile.name}. My ${categoryLabel} report is ready — I'd like to book my 15-min call.`);
  return `https://wa.me/${phone}?text=${text}`;
}

function emailTemplate({ name, categoryLabel, dashboardUrl, whatsappUrl }: { name: string; categoryLabel: string; dashboardUrl: string; whatsappUrl: string }): string {
  return `
    <p>Hi ${escapeHtml(name)},</p>
    <p>Your full <strong>${categoryLabel}</strong> assessment report is attached.</p>
    <p>Next steps:</p>
    <ul>
      <li><a href="${dashboardUrl}">Open your dashboard</a> to book your 15-min call</li>
      <li><a href="${whatsappUrl}">Reply on WhatsApp</a> if you have a quick question</li>
    </ul>
    <p>— John, Jobabroad</p>
  `;
}
```

3. Modify step 07's webhook handler to call `generateAndNotify` via `waitUntil`:
```ts
import { waitUntil } from '@vercel/functions';

// …inside webhook handler, after the successful UPDATE:
waitUntil(generateAndNotify(userId));
return NextResponse.json({ ok: true });
```

4. The generator from step 08 returns extended shape:
```ts
{ pdfBuffer: Buffer; signedUrl: string; profile: Profile; user: User; categoryLabel: string }
```
(Update step 08's generator signature accordingly.)

5. **Pre-existing-assessment guard** (per Bucket B decision: "no users yet"): add a TODO comment in `generateAndNotify`:
```ts
// TODO: pre-existing-assessment guard. v1 ships before any real user has
// submitted an assessment, so this can't arise in practice. If we ever
// add new fields to the assessment schema after launch and an earlier
// buyer's assessment lacks them, scoring will produce a thinner report.
// Detect via `assessment.data['situation.family_status'] === undefined`
// and either skip generation with a "complete profile" email or accept
// the partial report.
```

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| modify | `lib/email/brevo.ts` | Support attachment array |
| modify | `lib/reports/generator.ts` | Return shape includes profile + user + categoryLabel |
| create | `lib/notifications/report-ready.ts` | Orchestrate generate + email + WhatsApp deep link |
| modify | `app/api/payments/webhook/route.ts` | Add `waitUntil(generateAndNotify(userId))` after successful flip |
| modify | `package.json` | Add `@vercel/functions` if not present |

## Done When

1. Successful payment webhook → tier flips → background task generates PDF + sends email with attachment → user receives email within ~30s of paying.
2. Email body includes the WhatsApp deep-link "Reply on WhatsApp" button.
3. Webhook responds 200 within ~500ms (not blocked by generation).
4. If generation fails, webhook still returns 200 (don't retry the payment); generation can be re-triggered manually by the user from `/dashboard` (step 08's generator is idempotent).
5. Build passes; `@vercel/functions` `waitUntil` keeps the function alive long enough for completion.

## Gotchas

- `waitUntil` is Vercel-specific. Locally (`npm run dev`) it's a no-op shim that resolves immediately — generation still runs because the function process stays alive. Document this so local testers know not to expect a 30-min wait in dev.
- If you switch to a real WhatsApp send later (Twilio etc.), wrap behind `lib/whatsapp/notify.ts` and call from `generateAndNotify`. Keep `generateAndNotify` as the single orchestrator.
- WhatsApp deep link uses `NEXT_PUBLIC_WHATSAPP_NUMBER` (already in env). No new env var.
