import 'server-only';

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

export interface SendEmailOptions {
  from: { email: string; name: string };
  to: Array<{ email: string; name?: string }>;
  replyTo?: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  attachment?: Array<{ name: string; content: string }>; // base64
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const key = process.env.BREVO_API_KEY;
  if (!key) throw new Error('BREVO_API_KEY missing');

  // Brevo's transactional API uses `sender`, not `from`. Map our friendlier
  // interface to their expected shape.
  const { from, ...rest } = opts;
  const payload = { sender: from, ...rest };

  const r = await fetch(BREVO_API, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`brevo_${r.status}: ${t}`);
  }
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function stripNewlines(s: string): string {
  return s.replace(/[\r\n]+/g, ' ').trim();
}
