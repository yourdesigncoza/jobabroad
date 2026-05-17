import 'server-only';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { escapeHtml, sendEmail } from '@/lib/email/brevo';
import type { Band, DimensionResult } from '@/lib/scoring/types';

const FROM_EMAIL_DEFAULT = 'no-reply@jobabroad.co.za';
const FROM_NAME_DEFAULT = 'Jobabroad';

const BAND_LABEL: Record<Band, string> = {
  high_blockers: 'High blockers',
  needs_prep: 'Needs prep',
  strong_potential: 'Strong potential',
};

const BAND_TAGLINE: Record<Band, string> = {
  high_blockers: 'Significant gaps to close before applying.',
  needs_prep: 'Real potential, with clear gaps to address.',
  strong_potential: "You're application-ready in most respects.",
};

interface SendScoreEmailInput {
  userId: string;
  assessmentId: string;
  categoryId: string;
  categoryLabel: string;
  overall: number;
  band: Band;
  dimensions: DimensionResult[];
  whatsWorking: string;
  whatsBlocking: string;
}

/**
 * Mirrors the /score page in a plain HTML email. Sent fire-and-forget on the
 * FIRST visit to /score (gated by assessments.score_email_sent_at), so the
 * user has a takeaway record even if they bounce off the website.
 *
 * Atomically updates score_email_sent_at BEFORE sending, with `eq('score_email_sent_at', null)`
 * as the WHERE filter, so a double-load race can't double-send. If the UPDATE
 * touched 0 rows, another request already sent the email — bail out.
 */
export async function sendScoreEmailOnce(input: SendScoreEmailInput): Promise<void> {
  const svc = createSupabaseServiceClient();

  // Atomic claim — only one concurrent request can flip null -> now().
  const { data: claimed, error: claimErr } = await svc
    .from('assessments')
    .update({ score_email_sent_at: new Date().toISOString() })
    .eq('id', input.assessmentId)
    .is('score_email_sent_at', null)
    .select('id')
    .maybeSingle();
  if (claimErr) {
    console.error('[score-email] claim failed', input.assessmentId, claimErr);
    return;
  }
  if (!claimed) return; // already sent in a race

  // Look up the buyer's email separately — assessments has no email column.
  const { data: authData } = await svc.auth.admin.getUserById(input.userId);
  const userEmail = authData?.user?.email ?? '';
  if (!userEmail) {
    console.warn('[score-email] no email for user; skipping', input.userId);
    return;
  }

  const { data: profile } = await svc
    .from('profiles')
    .select('name')
    .eq('user_id', input.userId)
    .single();
  const userName = profile?.name?.trim() || 'there';

  const fromEmail = process.env.BREVO_FROM_EMAIL || FROM_EMAIL_DEFAULT;
  const fromName = process.env.BREVO_FROM_NAME || FROM_NAME_DEFAULT;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jobabroad.co.za';
  const scoreUrl = `${baseUrl}/members/${input.categoryId}/score`;

  try {
    await sendEmail({
      from: { email: fromEmail, name: fromName },
      to: [{ email: userEmail, name: profile?.name ?? undefined }],
      subject: `Your ${input.categoryLabel} eligibility score: ${input.overall}/100 (${BAND_LABEL[input.band]})`,
      htmlContent: emailHtml({
        userName,
        categoryLabel: input.categoryLabel,
        overall: input.overall,
        band: input.band,
        dimensions: input.dimensions,
        whatsWorking: input.whatsWorking,
        whatsBlocking: input.whatsBlocking,
        scoreUrl,
      }),
    });
  } catch (err) {
    // Email send failed AFTER the claim succeeded — we won't retry on next
    // visit because the timestamp is set. Logged but not fatal: the user
    // still has the live /score page.
    console.error('[score-email] send failed', input.assessmentId, err);
  }
}

function emailHtml({
  userName,
  categoryLabel,
  overall,
  band,
  dimensions,
  whatsWorking,
  whatsBlocking,
  scoreUrl,
}: {
  userName: string;
  categoryLabel: string;
  overall: number;
  band: Band;
  dimensions: DimensionResult[];
  whatsWorking: string;
  whatsBlocking: string;
  scoreUrl: string;
}): string {
  const dimsHtml = dimensions
    .map((d) => {
      const colour = d.score < 40 ? '#B53A2B' : d.score < 70 ? '#C9A84C' : '#1B4D3E';
      return `
        <tr>
          <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#2C2C2C;">${escapeHtml(d.label)}</td>
          <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6B6B6B;text-align:right;">${d.score}/100 · ${Math.round(d.weight * 100)}%</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:0 0 8px;">
            <div style="height:6px;background:#EDE8E0;border-radius:3px;overflow:hidden;">
              <div style="width:${d.score}%;height:6px;background:${colour};"></div>
            </div>
          </td>
        </tr>`;
    })
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#2C2C2C;max-width:600px;">
      <p>Hi ${escapeHtml(userName)},</p>
      <p>Here's your ${escapeHtml(categoryLabel)} eligibility summary. Keep this email for reference, the full page is here anytime: <a href="${scoreUrl}" style="color:#1B4D3E;">${scoreUrl}</a></p>

      <div style="background:#FFFFFF;border-left:4px solid #C9A84C;padding:20px;margin:20px 0;">
        <p style="margin:0;font-size:48px;font-weight:bold;color:#ff751f;line-height:1;">
          ${overall}<span style="font-size:24px;color:#2C2C2C;"> / 100</span>
        </p>
        <p style="margin:8px 0 0;font-weight:bold;text-transform:uppercase;font-size:13px;color:#7A6428;">
          ${escapeHtml(BAND_LABEL[band])}
        </p>
        <p style="margin:4px 0 0;font-size:14px;color:#2C2C2C;">${escapeHtml(BAND_TAGLINE[band])}</p>

        <p style="margin:20px 0 8px;text-transform:uppercase;font-size:11px;font-weight:bold;color:#6B6B6B;letter-spacing:1px;">Your score breakdown</p>
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">${dimsHtml}</table>
      </div>

      <div style="background:#FFFFFF;padding:20px;margin:20px 0;">
        <p style="margin:0 0 8px;text-transform:uppercase;font-size:11px;font-weight:bold;color:#1B4D3E;letter-spacing:1px;">What's working</p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.5;">${escapeHtml(whatsWorking)}</p>

        <p style="margin:0 0 8px;text-transform:uppercase;font-size:11px;font-weight:bold;color:#B53A2B;letter-spacing:1px;">Biggest blocker</p>
        <p style="margin:0;font-size:14px;line-height:1.5;">${escapeHtml(whatsBlocking)}</p>
      </div>

      <p style="font-size:14px;">Want the full picture? Upgrade to the R495 plan: a personalised PDF action plan written after a 15-min live call with us.</p>
      <p>
        <a href="${scoreUrl}" style="display:inline-block;background:#1B4D3E;color:#F8F5F0;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;text-transform:uppercase;font-size:13px;letter-spacing:0.5px;">View your full score &rarr;</a>
      </p>
      <p style="font-size:12px;color:#6B6B6B;">&mdash; The Jobabroad team</p>
    </div>
  `;
}
