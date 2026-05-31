import 'server-only';
import { sendEmail, escapeHtml } from '@/lib/email/brevo';

const FROM_EMAIL_DEFAULT = 'no-reply@jobabroad.co.za';
const FROM_NAME_DEFAULT = 'Jobabroad';

export interface NudgeEmailParams {
  userEmail: string;
  userName: string;
  categoryLabel: string;
  categorySlug: string;
  /** <=8-word recap of the last chat, or null for users with no chat yet. */
  lastTopic: string | null;
  /** Label of the next incomplete milestone, or null if all complete. */
  nextMilestoneLabel: string | null;
  unsubToken: string;
}

/**
 * Proactive re-engagement email. Returns true only on a confirmed Brevo send,
 * so the cron sets agent_last_nudge_at only when the email actually went out.
 * Zero LLM calls — recap + next step are templated from stored journey state.
 */
export async function sendNudgeEmail(params: NudgeEmailParams): Promise<boolean> {
  try {
    if (!params.userEmail) return false;
    const fromEmail = process.env.BREVO_FROM_EMAIL || FROM_EMAIL_DEFAULT;
    const fromName = process.env.BREVO_FROM_NAME || FROM_NAME_DEFAULT;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jobabroad.co.za';
    const coachUrl = `${baseUrl}/members/${params.categorySlug}/coach`;
    const unsubUrl = `${baseUrl}/api/agent/unsubscribe?token=${encodeURIComponent(params.unsubToken)}`;

    await sendEmail({
      from: { email: fromEmail, name: fromName },
      to: [{ email: params.userEmail, name: params.userName }],
      subject: nudgeSubject(params),
      htmlContent: nudgeHtml({ ...params, coachUrl, unsubUrl }),
    });
    return true;
  } catch (err) {
    console.error('[agent-nudge-email] send failed', { email: params.userEmail, err });
    return false;
  }
}

function nudgeSubject(p: NudgeEmailParams): string {
  if (p.nextMilestoneLabel) return `Your next step: ${p.nextMilestoneLabel}`;
  return `Picking up your ${p.categoryLabel} plan`;
}

function nudgeHtml(
  p: NudgeEmailParams & { coachUrl: string; unsubUrl: string },
): string {
  const recap = p.lastTopic
    ? `<p>Last time we talked about <strong>${escapeHtml(p.lastTopic)}</strong>.</p>`
    : `<p>It's been a little while since we caught up on your plan.</p>`;
  const nextStep = p.nextMilestoneLabel
    ? `<p>Your next step is <strong>${escapeHtml(p.nextMilestoneLabel)}</strong>. Want to tackle it together? Your assistant is ready whenever you are.</p>`
    : `<p>You've made great progress. Come back any time if a new question comes up.</p>`;

  return `
    <p>Hi ${escapeHtml(p.userName)},</p>
    ${recap}
    ${nextStep}
    <p>
      <a href="${p.coachUrl}" style="display:inline-block;background:#1B4D3E;color:#F8F5F0;padding:12px 24px;border-radius:10px;text-decoration:none;font-family:sans-serif;font-weight:600;text-transform:uppercase;font-size:13px;letter-spacing:0.5px;">
        Chat with your assistant &rarr;
      </a>
    </p>
    <p>&mdash; The Jobabroad team</p>
    <hr style="border:none;border-top:1px solid #EDE8E0;margin:24px 0;">
    <p style="color:#999;font-size:12px;">
      Don't want these reminders? <a href="${p.unsubUrl}" style="color:#999;">Unsubscribe</a>.
    </p>
  `;
}
