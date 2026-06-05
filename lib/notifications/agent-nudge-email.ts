import 'server-only';
import { sendEmail, escapeHtml } from '@/lib/email/brevo';

const FROM_EMAIL_DEFAULT = 'no-reply@jobabroad.co.za';
// John's voice: the email is from a person, not a brand. Replies route to a
// monitored mailbox so "just reply" is a real offer, not a dead end.
const FROM_NAME_DEFAULT = 'John at Jobabroad';
const REPLY_TO_DEFAULT = 'hello@jobabroad.co.za';

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
    const replyTo = process.env.RELAUNCH_REPLY_TO || REPLY_TO_DEFAULT;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jobabroad.co.za';
    const coachUrl = `${baseUrl}/members/${params.categorySlug}/coach`;
    const unsubUrl = `${baseUrl}/api/agent/unsubscribe?token=${encodeURIComponent(params.unsubToken)}`;

    await sendEmail({
      from: { email: fromEmail, name: fromName },
      to: [{ email: params.userEmail, name: params.userName }],
      replyTo: { email: replyTo, name: 'John' },
      subject: nudgeSubject(params),
      htmlContent: nudgeHtml({ ...params, coachUrl, unsubUrl }),
    });
    return true;
  } catch (err) {
    console.error('[agent-nudge-email] send failed', { email: params.userEmail, err });
    return false;
  }
}

function firstName(name: string): string {
  return (name || '').trim().split(/\s+/)[0] || 'there';
}

function nudgeSubject(p: NudgeEmailParams): string {
  if (p.nextMilestoneLabel) return `Your next step: ${p.nextMilestoneLabel}`;
  return `Still here when you're ready, ${firstName(p.userName)}`;
}

function nudgeHtml(
  p: NudgeEmailParams & { coachUrl: string; unsubUrl: string },
): string {
  // Recap: nod to where they were, gently. No guilt-tripping about the gap.
  const recap = p.lastTopic
    ? `<p style="margin:0 0 14px;">When we last spoke you were looking at <strong>${escapeHtml(p.lastTopic)}</strong>. I didn&rsquo;t want it to fall off your radar.</p>`
    : `<p style="margin:0 0 14px;">It&rsquo;s been a little while since you looked at your ${escapeHtml(p.categoryLabel)} plan &mdash; no pressure, I just wanted to check you&rsquo;re not stuck.</p>`;

  // Next step: concrete and small, framed as "you don't have to do it alone".
  const nextStep = p.nextMilestoneLabel
    ? `<p style="margin:0 0 14px;">Whenever you&rsquo;ve got ten minutes, the next thing worth doing is <strong>${escapeHtml(p.nextMilestoneLabel)}</strong>. You don&rsquo;t have to figure it out on your own &mdash; open your plan and we&rsquo;ll work through it together.</p>`
    : `<p style="margin:0 0 14px;">Honestly, you&rsquo;ve done the hard part already. If a new question comes up, I&rsquo;m right here &mdash; just pick up where you left off.</p>`;

  const ctaLabel = p.nextMilestoneLabel
    ? `Open my ${escapeHtml(p.categoryLabel)} plan`
    : `Pick up my plan`;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#F8F5F0;font-family:'DM Sans',Arial,sans-serif;color:#2C2C2C;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;">
      <tr>
        <td style="background:#1B4D3E;padding:20px 28px;">
          <span style="font-family:Oswald,Arial,sans-serif;font-size:22px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#ffffff;">job<span style="color:#ff751f;">abroad</span></span>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;font-size:15px;line-height:1.65;">
          <p style="margin:0 0 14px;">Hi ${escapeHtml(firstName(p.userName))},</p>
          ${recap}
          ${nextStep}
          <p style="margin:0 0 24px;">
            <a href="${p.coachUrl}" style="display:inline-block;background:#1B4D3E;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:6px;font-size:15px;font-weight:600;">${ctaLabel} &rarr;</a>
          </p>
          <p style="margin:0 0 4px;color:#6B6B6B;font-size:14px;">Stuck or unsure about anything? Just reply to this email &mdash; a real person (me) reads every one.</p>
          <p style="margin:14px 0 0;font-size:14px;">&mdash; John, Jobabroad</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 28px 24px;">
          <p style="margin:0;font-size:11px;color:#9a9a9a;">You asked us to nudge you about your next steps. Changed your mind? <a href="${p.unsubUrl}" style="color:#9a9a9a;">Unsubscribe</a> &mdash; no hard feelings.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
