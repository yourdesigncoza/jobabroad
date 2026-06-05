// Re-engagement / official-launch email to existing registered users.
//
// Context: pre-2026-06-02 signups arrived (largely via ChatGPT referrals) while
// the site was still being built and several verticals were incomplete — so many
// users had a thin first experience. All 11 pathways are now complete and the
// payment gate is off. This invites them back to the finished, free product.
//
// SAFETY: sends NOTHING by default. Three-rung ladder, you fire it yourself:
//   (default)  dry-run  — render preview HTML + list recipients, send nothing
//   --test     send ONE email to TEST_TO (default laudes.michael@gmail.com)
//   --send     send to every eligible real user
//
// Run:
//   NODE_OPTIONS="--require ./scripts/shim-server-only.cjs" npx tsx scripts/send-relaunch.ts
//   NODE_OPTIONS="--require ./scripts/shim-server-only.cjs" npx tsx scripts/send-relaunch.ts --test
//   NODE_OPTIONS="--require ./scripts/shim-server-only.cjs" npx tsx scripts/send-relaunch.ts --send
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { escapeHtml, sendEmail } from "@/lib/email/brevo";
import { CATEGORIES } from "@/lib/categories";

const MODE = process.argv.includes("--send")
  ? "send"
  : process.argv.includes("--test")
    ? "test"
    : "dry";
const TEST_TO = process.env.RELAUNCH_TEST_TO || "laudes.michael@gmail.com";

// Never email these — John's own admin account + a test address. Add more via
// RELAUNCH_EXCLUDE (comma-separated) if needed.
const EXCLUDE = new Set(
  [
    "laudes.michael@gmail.com",
    "support@yourdesign.co.za",
    ...(process.env.RELAUNCH_EXCLUDE ?? "").split(","),
  ]
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

// RELAUNCH_ONLY (comma-separated) restricts the send to an explicit allowlist —
// used to re-mail just the batch that received the broken-link version, rather
// than every eligible user. Empty = no restriction (normal full send).
const ONLY = new Set(
  (process.env.RELAUNCH_ONLY ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "no-reply@jobabroad.co.za";
const FROM_NAME = process.env.BREVO_FROM_NAME || "John at Jobabroad";
// Branded reply-to so replies stay on the jobabroad domain (hello@ is the public
// contact address). Override with RELAUNCH_REPLY_TO. NB: only works if this
// mailbox actually delivers to John — verify by replying to the --test email.
const REPLY_TO = process.env.RELAUNCH_REPLY_TO || "hello@jobabroad.co.za";
// RELAUNCH_BASE_URL is the explicit override for production sends. We do NOT
// trust NEXT_PUBLIC_BASE_URL blindly: this script runs locally, where .env.local
// sets it to http://localhost:3000 — which silently bakes dead localhost links
// into every CTA (this happened on the 2026-06-02 batch). The guard below aborts
// a real --send if the resolved URL is a dev host.
const BASE_URL =
  process.env.RELAUNCH_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://jobabroad.co.za";

// A real send must never emit dev links — every CTA would be dead for recipients.
if (MODE === "send" && /localhost|127\.0\.0\.1/.test(BASE_URL)) {
  console.error(
    `ABORT: BASE_URL is '${BASE_URL}' — that's a dev URL, every link would be dead.\n` +
      `Re-run with an explicit production URL:\n` +
      `  RELAUNCH_BASE_URL=https://jobabroad.co.za NODE_OPTIONS="--require ./scripts/shim-server-only.cjs" npx tsx scripts/send-relaunch.ts --send`,
  );
  process.exit(1);
}

type Recipient = {
  email: string;
  name: string;
  category: string;
  categoryLabel: string;
};

function firstName(name: string): string {
  return (name || "").trim().split(/\s+/)[0] || "there";
}

function subjectFor(r: Recipient): string {
  return `Jobabroad is officially live — your ${r.categoryLabel} pathway is ready`;
}

function bodyFor(r: Recipient): string {
  const loginUrl = `${BASE_URL}/login?next=${encodeURIComponent(`/members/${r.category}`)}`;
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
          <p style="margin:0 0 6px;font-family:Oswald,Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;">We&rsquo;re officially live</p>
          <h1 style="margin:0 0 18px;font-family:Oswald,Arial,sans-serif;font-size:24px;color:#2C2C2C;">Hi ${escapeHtml(firstName(r.name))}, your ${escapeHtml(r.categoryLabel)} pathway is ready</h1>

          <p style="margin:0 0 14px;">First, a small apology. If you opened our last email and the button didn&rsquo;t take you anywhere, that was a teething issue on our side &mdash; the link was pointing to the wrong place. Entirely our fault, and now fixed. The button below will take you straight in.</p>

          <p style="margin:0 0 14px;">When you first signed up, we were still building Jobabroad and some pathways weren&rsquo;t finished yet. If your first visit felt thin or unfinished, that was on us, not you.</p>

          <p style="margin:0 0 14px;">Today that changes. <strong>Every pathway is now complete, including ${escapeHtml(r.categoryLabel)}.</strong> And we&rsquo;ve removed the payment gate, your full personalised eligibility assessment, your detailed ${escapeHtml(r.categoryLabel)} pathway guide, and your tailored report are all <strong>free</strong> to access.</p>

          <p style="margin:0 0 22px;">It takes a few minutes and tells you exactly where you stand and what to do next.</p>

          <p style="margin:0 0 24px;">
            <a href="${loginUrl}" style="display:inline-block;background:#1B4D3E;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:6px;font-size:15px;font-weight:600;">Open my ${escapeHtml(r.categoryLabel)} pathway</a>
          </p>

          <p style="margin:0 0 4px;color:#6B6B6B;font-size:14px;">Just reply to this email if anything&rsquo;s off or you have a question a real person reads every one.</p>
          <p style="margin:14px 0 0;font-size:14px;">&mdash; John, Jobabroad</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 28px 24px;">
          <p style="margin:0;font-size:11px;color:#9a9a9a;">You&rsquo;re receiving this because you registered at jobabroad.co.za. Reply &ldquo;stop&rdquo; and we&rsquo;ll take you off the list. Inactive accounts may be removed after 90 days, so log in to keep yours active.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function main() {
  const svc = createSupabaseServiceClient();
  const [authRes, profilesRes] = await Promise.all([
    svc.auth.admin.listUsers({ perPage: 500 }),
    svc.from("profiles").select("user_id, name, category"),
  ]);

  const authById = new Map<string, { email: string; confirmed: boolean }>();
  for (const u of authRes.data?.users ?? []) {
    authById.set(u.id, {
      email: u.email ?? "",
      confirmed: Boolean(u.email_confirmed_at || u.confirmed_at),
    });
  }

  const recipients: Recipient[] = [];
  for (const p of profilesRes.data ?? []) {
    const auth = authById.get(p.user_id);
    if (!auth?.email || !auth.confirmed) continue; // confirmed accounts only
    const email = auth.email.toLowerCase();
    if (email.startsWith("playwright+") || email.endsWith("@example.com"))
      continue; // skip test users
    if (EXCLUDE.has(email)) continue; // John's admin + test addresses
    if (ONLY.size && !ONLY.has(email)) continue; // allowlist (broken-link batch)
    const category = (p.category as string) || "";
    recipients.push({
      email: auth.email,
      name: (p.name as string) || "",
      category,
      categoryLabel:
        CATEGORIES.find((c) => c.id === category)?.label ?? category,
    });
  }

  console.log(`MODE=${MODE} · ${recipients.length} eligible recipient(s)`);

  if (MODE === "dry") {
    const outDir = join(process.cwd(), "docs/prompt-tests");
    mkdirSync(outDir, { recursive: true });
    const sample = recipients[0] ?? {
      email: "sample@example.com",
      name: "Thandeka Nkosi",
      category: "hospitality",
      categoryLabel: "Hospitality",
    };
    const previewPath = join(outDir, "relaunch-preview.html");
    writeFileSync(previewPath, bodyFor(sample));
    console.log("would email:");
    for (const r of recipients)
      console.log(`  - ${r.email}  (${r.categoryLabel})`);
    console.log(`\nsubject (sample): ${subjectFor(sample)}`);
    console.log(
      `preview written: ${previewPath}  (rendered for ${sample.name || sample.email})`,
    );
    console.log(
      "\nDRY RUN — nothing sent. Use --test to send one to yourself, --send for all.",
    );
    return;
  }

  const targets =
    MODE === "test"
      ? [
          {
            email: TEST_TO,
            name: "John",
            category: "hospitality",
            categoryLabel: "Hospitality",
          } as Recipient,
        ]
      : recipients;

  let ok = 0;
  let failed = 0;
  for (const r of targets) {
    try {
      await sendEmail({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: r.email, name: r.name }],
        replyTo: { email: REPLY_TO, name: "John" },
        subject: subjectFor(r),
        htmlContent: bodyFor(r),
      });
      ok++;
      console.log(`  sent → ${r.email}`);
    } catch (err) {
      failed++;
      console.error(`  FAILED → ${r.email}`, err);
    }
  }
  console.log(`\nDone. sent=${ok} failed=${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
