import 'server-only';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { escapeHtml, sendEmail } from '@/lib/email/brevo';

const FROM_EMAIL_DEFAULT = 'no-reply@jobabroad.co.za';
const FROM_NAME_DEFAULT = 'Jobabroad';

/**
 * Buyer-facing "Your report is ready" email. Called from the payments webhook
 * (and the /paid fallback) once generateReport finishes writing the PDF. PDF
 * is attached; body also links back to the dashboard as a fallback in case the
 * attachment is stripped by spam filters.
 *
 * Swallows all errors so a Brevo blip can't poison the webhook ack — the buyer
 * can always download from the dashboard if the email fails.
 */
export async function sendReportReadyEmail(
  userId: string,
  pdfBuffer: Buffer,
  userName: string,
  categoryLabel: string,
): Promise<void> {
  try {
    const svc = createSupabaseServiceClient();
    const { data: authData } = await svc.auth.admin.getUserById(userId);
    const userEmail = authData?.user?.email ?? '';
    if (!userEmail) {
      console.warn('[report-ready-email] no email for user; skipping', userId);
      return;
    }

    const fromEmail = process.env.BREVO_FROM_EMAIL || FROM_EMAIL_DEFAULT;
    const fromName = process.env.BREVO_FROM_NAME || FROM_NAME_DEFAULT;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jobabroad.co.za';
    const dashboardUrl = `${baseUrl}/dashboard`;
    const safeLabel = categoryLabel.toLowerCase().replace(/\s+/g, '-');

    await sendEmail({
      from: { email: fromEmail, name: fromName },
      to: [{ email: userEmail, name: userName }],
      subject: `Your personalised ${categoryLabel} report is ready`,
      htmlContent: emailHtml({ userName, categoryLabel, dashboardUrl }),
      attachment: [
        {
          name: `jobabroad-${safeLabel}-report.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ],
    });
  } catch (err) {
    console.error('[report-ready-email] send failed', { userId, err });
  }
}

function emailHtml({
  userName,
  categoryLabel,
  dashboardUrl,
}: {
  userName: string;
  categoryLabel: string;
  dashboardUrl: string;
}): string {
  return `
    <p>Hi ${escapeHtml(userName)},</p>
    <p>Thanks for upgrading. Your personalised <strong>${escapeHtml(categoryLabel)}</strong> report is attached to this email, and it's also waiting in your dashboard.</p>
    <p>
      <a href="${dashboardUrl}" style="display:inline-block;background:#1B4D3E;color:#F8F5F0;padding:12px 24px;border-radius:10px;text-decoration:none;font-family:sans-serif;font-weight:600;text-transform:uppercase;font-size:13px;letter-spacing:0.5px;">
        Open dashboard &rarr;
      </a>
    </p>
    <p>If you'd like to talk it through, you can book a 15-min call from your dashboard whenever you're ready &mdash; no rush, no pressure.</p>
    <p>You also have 5 follow-up questions available from your dashboard, ready whenever you need clarification.</p>
    <p>&mdash; The Jobabroad team</p>
  `;
}
