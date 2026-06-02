import 'server-only';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { escapeHtml, sendEmail } from '@/lib/email/brevo';
import { CATEGORIES } from '@/lib/categories';

const FROM_EMAIL_DEFAULT = 'no-reply@jobabroad.co.za';
const FROM_NAME_DEFAULT = 'Jobabroad';

export type NewUserNotifyResult = {
  sent: boolean;
  reason?: 'already_notified' | 'no_recipients' | 'no_profile' | 'no_email' | 'error';
};

/**
 * Admin-facing "a new user just confirmed their email" notification. Fired from
 * the email-confirmation callback (app/auth/callback) via waitUntil, so it only
 * fires for genuinely confirmed accounts — not abandoned signups.
 *
 * Idempotent: writes profiles.admin_notified_at on success and short-circuits
 * if it's already set, so a resend-confirmation (fresh code) or a repeat
 * callback hit can't email the admin twice.
 *
 * Recipients come from ADMIN_EMAILS (comma-separated), the same allow-list that
 * gates /admin. Swallows all errors so a Brevo blip can't break the user's
 * confirmation redirect.
 */
export async function notifyAdminOfNewUser(userId: string): Promise<NewUserNotifyResult> {
  try {
    const svc = createSupabaseServiceClient();

    const { data: profile } = await svc
      .from('profiles')
      .select('name, phone, category, admin_notified_at')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      console.warn('[new-user-admin-email] no profile; skipping', userId);
      return { sent: false, reason: 'no_profile' };
    }
    if (profile.admin_notified_at) {
      // Already notified — idempotent no-op.
      return { sent: false, reason: 'already_notified' };
    }

    const recipients = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    if (recipients.length === 0) {
      console.warn('[new-user-admin-email] ADMIN_EMAILS empty; skipping', userId);
      return { sent: false, reason: 'no_recipients' };
    }

    const { data: authData } = await svc.auth.admin.getUserById(userId);
    const userEmail = authData?.user?.email ?? '';
    if (!userEmail) {
      console.warn('[new-user-admin-email] no email for user; skipping', userId);
      return { sent: false, reason: 'no_email' };
    }

    const userName = (profile.name as string) || 'Unknown';
    const phone = (profile.phone as string) || '—';
    const categoryId = profile.category as string;
    const categoryLabel = CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;

    const fromEmail = process.env.BREVO_FROM_EMAIL || FROM_EMAIL_DEFAULT;
    const fromName = process.env.BREVO_FROM_NAME || FROM_NAME_DEFAULT;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jobabroad.co.za';

    await sendEmail({
      from: { email: fromEmail, name: fromName },
      to: recipients.map((email) => ({ email })),
      // Lets the admin reply straight to the new user from the notification.
      replyTo: { email: userEmail, name: userName },
      subject: `New registration: ${userName} (${categoryLabel})`,
      htmlContent: emailHtml({ userName, userEmail, phone, categoryLabel, baseUrl }),
    });

    // Mark notified only after a successful send, so a failed send retries on
    // the next callback hit rather than being silently swallowed forever.
    await svc
      .from('profiles')
      .update({ admin_notified_at: new Date().toISOString() })
      .eq('user_id', userId);

    return { sent: true };
  } catch (err) {
    console.error('[new-user-admin-email] send failed', { userId, err });
    return { sent: false, reason: 'error' };
  }
}

function emailHtml({
  userName,
  userEmail,
  phone,
  categoryLabel,
  baseUrl,
}: {
  userName: string;
  userEmail: string;
  phone: string;
  categoryLabel: string;
  baseUrl: string;
}): string {
  const adminUrl = `${baseUrl}/admin/post-call`;
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#F8F5F0;font-family:'DM Sans',Arial,sans-serif;color:#2C2C2C;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;">
      <tr>
        <td style="background:#1B4D3E;padding:20px 28px;">
          <span style="font-family:Oswald,Arial,sans-serif;font-size:20px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#ffffff;">job<span style="color:#ff751f;">abroad</span></span>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">
          <p style="margin:0 0 6px;font-family:Oswald,Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;">New registration</p>
          <h1 style="margin:0 0 16px;font-family:Oswald,Arial,sans-serif;font-size:24px;color:#2C2C2C;">${escapeHtml(userName)}</h1>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:15px;line-height:1.6;">
            <tr><td style="color:#6B6B6B;padding:4px 0;width:120px;">Category</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(categoryLabel)}</td></tr>
            <tr><td style="color:#6B6B6B;padding:4px 0;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(userEmail)}" style="color:#1B4D3E;">${escapeHtml(userEmail)}</a></td></tr>
            <tr><td style="color:#6B6B6B;padding:4px 0;">WhatsApp</td><td style="padding:4px 0;">${escapeHtml(phone)}</td></tr>
          </table>
          <p style="margin:20px 0 0;font-size:14px;color:#6B6B6B;">They confirmed their email and now have an active account. Reply to this email to reach them directly.</p>
          <p style="margin:20px 0 0;">
            <a href="${adminUrl}" style="display:inline-block;background:#1B4D3E;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px;">Open admin</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
