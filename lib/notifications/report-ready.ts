import 'server-only';
import { escapeHtml, sendEmail } from '@/lib/email/brevo';
import { generateReport, type GenerateReportOptions } from '@/lib/reports/generator';

const FROM_EMAIL_DEFAULT = 'no-reply@jobabroad.co.za';
const FROM_NAME_DEFAULT = 'Jobabroad';

/**
 * Generate the paid report + email it to the buyer with the PDF attached.
 * Called synchronously from /admin/post-call after the review call — the
 * admin sees success/failure inline, so this throws rather than swallowing.
 *
 * `opts.callNotes` carries forward whatever the admin typed on that screen;
 * the generator falls back to the stored call_notes if undefined.
 */
export async function generateAndNotify(
  userId: string,
  opts: GenerateReportOptions = {},
): Promise<void> {
  const { pdfBuffer, userEmail, userName, categoryLabel } = await generateReport(userId, opts);

  if (!userEmail) {
    throw new Error(`no_email_for_user: ${userId}`);
  }

  const fromEmail = process.env.BREVO_FROM_EMAIL || FROM_EMAIL_DEFAULT;
  const fromName = process.env.BREVO_FROM_NAME || FROM_NAME_DEFAULT;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jobabroad.co.za';
  const dashboardUrl = `${baseUrl}/dashboard`;

  await sendEmail({
    from: { email: fromEmail, name: fromName },
    to: [{ email: userEmail, name: userName }],
    subject: `Your personalised ${categoryLabel} report (post-call)`,
    htmlContent: emailHtml({ userName, categoryLabel, dashboardUrl }),
    attachment: [
      {
        name: `jobabroad-${categoryLabel.toLowerCase().replace(/\s+/g, '-')}-report.pdf`,
        content: pdfBuffer.toString('base64'),
      },
    ],
  });
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
    <p>Thanks for taking the call. Your personalised <strong>${escapeHtml(categoryLabel)}</strong> report is attached — it reflects what we discussed plus the supporting research from your pathway guide.</p>
    <p>Next steps:</p>
    <ul>
      <li>Work through the action items in the report at your own pace</li>
      <li>Use your remaining follow-up questions from <a href="${dashboardUrl}">your dashboard</a> whenever you need clarification</li>
    </ul>
    <p>&mdash; The Jobabroad team</p>
  `;
}
