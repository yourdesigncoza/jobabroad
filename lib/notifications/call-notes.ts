import 'server-only';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { escapeHtml, sendEmail } from '@/lib/email/brevo';
import { CATEGORIES } from '@/lib/categories';
import { PAYMENTS_ENABLED } from '@/lib/access';

const FROM_EMAIL_DEFAULT = 'no-reply@jobabroad.co.za';
const FROM_NAME_DEFAULT = 'Jobabroad';

/**
 * Buyer-facing "Notes from our review call" email. Called synchronously from
 * the admin save-notes action so the admin sees success/failure inline (no
 * fire-and-forget — they need to know if their typed notes actually reached
 * the buyer).
 *
 * Throws on failure. Caller is responsible for surfacing the error to the
 * admin.
 */
export async function sendCallNotesEmail(userId: string, notes: string): Promise<void> {
  const trimmed = notes.trim();
  if (!trimmed) throw new Error('call_notes_empty');

  const svc = createSupabaseServiceClient();
  const [{ data: profile }, { data: authData }] = await Promise.all([
    svc.from('profiles').select('name, category').eq('user_id', userId).single(),
    svc.auth.admin.getUserById(userId),
  ]);

  const userEmail = authData?.user?.email ?? '';
  if (!profile || !userEmail) {
    throw new Error(`call_notes_email_missing_user: ${userId}`);
  }

  const categoryLabel =
    CATEGORIES.find((c) => c.id === profile.category)?.label ?? profile.category;
  const userName = profile.name?.trim() || 'there';

  const fromEmail = process.env.BREVO_FROM_EMAIL || FROM_EMAIL_DEFAULT;
  const fromName = process.env.BREVO_FROM_NAME || FROM_NAME_DEFAULT;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jobabroad.co.za';
  const dashboardUrl = `${baseUrl}/dashboard`;

  await sendEmail({
    from: { email: fromEmail, name: fromName },
    to: [{ email: userEmail, name: profile.name ?? undefined }],
    subject: PAYMENTS_ENABLED
      ? `Notes from our ${categoryLabel} review call`
      : `Your ${categoryLabel} notes from Jobabroad`,
    htmlContent: emailHtml({ userName, categoryLabel, notes: trimmed, dashboardUrl }),
  });
}

function emailHtml({
  userName,
  categoryLabel,
  notes,
  dashboardUrl,
}: {
  userName: string;
  categoryLabel: string;
  notes: string;
  dashboardUrl: string;
}): string {
  const paragraphs = notes
    .split(/\n\s*\n/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');

  return `
    <p>Hi ${escapeHtml(userName)},</p>
    <p>${
      PAYMENTS_ENABLED
        ? `Thanks for taking the time on our ${escapeHtml(categoryLabel)} review call. Here's a writeup of what we discussed and the next steps for you:`
        : `Here are some notes on your ${escapeHtml(categoryLabel)} work-abroad plan, with the next steps for you:`
    }</p>
    <div style="border-left:3px solid #C9A84C;padding:8px 16px;margin:16px 0;background:#FFF8E8;font-family:sans-serif;">
      ${paragraphs}
    </div>
    <p>These notes are also saved on <a href="${dashboardUrl}">your dashboard</a> so you can revisit them any time.</p>
    <p>&mdash; The Jobabroad team</p>
  `;
}
