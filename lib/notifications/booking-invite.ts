import 'server-only';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { escapeHtml, sendEmail } from '@/lib/email/brevo';
import { CATEGORIES } from '@/lib/categories';

const FROM_EMAIL_DEFAULT = 'no-reply@jobabroad.co.za';
const FROM_NAME_DEFAULT = 'Jobabroad';

/**
 * Fire-and-forget post-payment email. Sends the buyer a booking link for their
 * 15-min review call — no PDF attached. The personalised report is generated
 * AFTER the call by the admin post-call action (see step 3 of the paid-flow
 * refactor); buyers should not receive a pre-call PDF.
 *
 * Swallows all errors so a Brevo blip can't poison the webhook ack — the buyer
 * can always reach the booking page from the dashboard if this email fails.
 */
export async function sendBookingInvite(userId: string): Promise<void> {
  try {
    const svc = createSupabaseServiceClient();

    const { data: profile } = await svc
      .from('profiles')
      .select('name, category')
      .eq('user_id', userId)
      .single();

    const { data: authData } = await svc.auth.admin.getUserById(userId);
    const userEmail = authData?.user?.email ?? '';

    if (!profile || !userEmail) {
      console.warn('[booking-invite] missing profile or email; skipping', userId);
      return;
    }

    const categoryLabel =
      CATEGORIES.find((c) => c.id === profile.category)?.label ?? profile.category;
    const userName = profile.name?.trim() || 'there';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jobabroad.co.za';
    const bookUrl = `${baseUrl}/members/${profile.category}/book`;
    const fromEmail = process.env.BREVO_FROM_EMAIL || FROM_EMAIL_DEFAULT;
    const fromName = process.env.BREVO_FROM_NAME || FROM_NAME_DEFAULT;

    await sendEmail({
      from: { email: fromEmail, name: fromName },
      to: [{ email: userEmail, name: profile.name ?? undefined }],
      subject: `You're in — book your 15-min ${categoryLabel} review call`,
      htmlContent: emailHtml({ userName, categoryLabel, bookUrl }),
    });
  } catch (err) {
    console.error('[booking-invite] send failed', { userId, err });
  }
}

function emailHtml({
  userName,
  categoryLabel,
  bookUrl,
}: {
  userName: string;
  categoryLabel: string;
  bookUrl: string;
}): string {
  return `
    <p>Hi ${escapeHtml(userName)},</p>
    <p>Thanks for upgrading to the full <strong>${escapeHtml(categoryLabel)}</strong> assessment.</p>
    <p><strong>Next step: book your 15-min review call.</strong></p>
    <p>
      <a href="${bookUrl}" style="display:inline-block;background:#1B4D3E;color:#F8F5F0;padding:12px 24px;border-radius:10px;text-decoration:none;font-family:sans-serif;font-weight:600;text-transform:uppercase;font-size:13px;letter-spacing:0.5px;">
        Book your call &rarr;
      </a>
    </p>
    <p>We use the call to understand your specific situation, work history, certifications, target country, and any concerns. Right after we speak, we write up your personalised pathway and action plan, then email you the PDF report.</p>
    <p>You also have 5 follow-up questions available from your dashboard, ready whenever you need clarification.</p>
    <p>&mdash; The Jobabroad team</p>
  `;
}
