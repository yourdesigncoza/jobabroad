import 'server-only';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { escapeHtml, sendEmail } from '@/lib/email/brevo';
import { PAYMENTS_ENABLED } from '@/lib/access';

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
  const intro = PAYMENTS_ENABLED
    ? `Thanks for upgrading. Your personalised <strong>${escapeHtml(categoryLabel)}</strong> report is attached to this email, and it's also waiting in your dashboard.`
    : `Great news — your personalised <strong>${escapeHtml(categoryLabel)}</strong> report is ready. It's attached to this email and waiting in your dashboard. It's yours free for completing your eligibility check.`;

  // Coach + booking call are part of the (currently shelved) paid tier, so only
  // mention them when payments are on.
  const extras = PAYMENTS_ENABLED
    ? `<p>You also have your personal ${escapeHtml(categoryLabel)} Abroad assistant in your dashboard — chat any time for grounded answers and to track your next steps.</p>`
    : '';

  return `
    <p>Hi ${escapeHtml(userName)},</p>
    <p>${intro}</p>
    <p>
      <a href="${dashboardUrl}" style="display:inline-block;background:#1B4D3E;color:#F8F5F0;padding:12px 24px;border-radius:10px;text-decoration:none;font-family:sans-serif;font-weight:600;text-transform:uppercase;font-size:13px;letter-spacing:0.5px;">
        Open dashboard &rarr;
      </a>
    </p>
    ${extras}
    <p>&mdash; The Jobabroad team</p>
  `;
}
