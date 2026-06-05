import type { Metadata } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { requireAdmin } from '@/lib/auth-guards';
import { CATEGORIES } from '@/lib/categories';
import { extractPersonalContext } from '@/lib/agent/prompt';
import { calculateScore, loadRubric } from '@/lib/scoring';
import type { Band, Rubric } from '@/lib/scoring/types';
import type { AssessmentData } from '@/lib/assessments/schemas/assessment';
import UsersDashboardClient, { type MemberRow } from './UsersDashboardClient';
import StatCard from '@/components/admin/StatCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin · Registered members',
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  await requireAdmin('/admin');

  const svc = createSupabaseServiceClient();

  // Pull everything in parallel: profiles (the registered-user spine), auth
  // users (email + registration timestamp), submitted assessments, report
  // status, chat activity, and the last journey topic.
  const [profilesRes, authRes, submittedRes, reportsRes, msgsRes, journeyRes] =
    await Promise.all([
      svc.from('profiles').select('user_id, name, category, tier, phone'),
      svc.auth.admin.listUsers(),
      svc
        .from('assessments')
        .select('user_id, data, updated_at')
        .eq('status', 'submitted')
        .order('updated_at', { ascending: false }),
      svc
        .from('paid_reports')
        .select('user_id, generated_at, generation_status, generation_attempts, pdf_path'),
      svc.from('agent_messages').select('user_id, role, created_at'),
      svc.from('user_journey').select('user_id, last_topic, incomplete_count'),
    ]);

  const authByUser = new Map<string, { email: string; createdAt: string | null }>();
  for (const u of authRes.data?.users ?? []) {
    if (u.id) authByUser.set(u.id, { email: u.email ?? '', createdAt: u.created_at ?? null });
  }

  // Submitted-assessment spine + each member's free-text "about you" (newest
  // assessment per user wins). Reuses the coach's extractor so admin reads
  // exactly what the assistant was handed for that member.
  const submittedUsers = new Set<string>();
  const aboutByUser = new Map<string, string>();
  const submittedDataByUser = new Map<string, AssessmentData | null>();
  for (const a of submittedRes.data ?? []) {
    const uid = a.user_id as string;
    submittedUsers.add(uid);
    if (!aboutByUser.has(uid)) {
      aboutByUser.set(uid, extractPersonalContext(a.data as AssessmentData | null));
      submittedDataByUser.set(uid, (a.data as AssessmentData | null) ?? null);
    }
  }

  // Eligibility score per submitted member — reuses the exact engine + rubrics
  // the score page and PDF report run on, so the admin number always matches what
  // the user was shown. Rubrics are loaded once per category (not per user).
  const categoryByUser = new Map<string, string>();
  for (const p of profilesRes.data ?? []) categoryByUser.set(p.user_id, p.category ?? '');

  const neededCategories = new Set<string>();
  for (const uid of submittedDataByUser.keys()) {
    const cat = categoryByUser.get(uid);
    if (cat) neededCategories.add(cat);
  }
  const rubricByCategory = new Map<string, Rubric | null>(
    await Promise.all(
      [...neededCategories].map(
        async (cat) => [cat, await loadRubric(cat)] as const,
      ),
    ),
  );

  const scoreByUser = new Map<string, { overall: number; band: Band }>();
  for (const [uid, data] of submittedDataByUser) {
    if (!data) continue;
    const rubric = rubricByCategory.get(categoryByUser.get(uid) ?? '');
    if (!rubric) continue;
    const { overall, band } = calculateScore(data, rubric);
    scoreByUser.set(uid, { overall, band });
  }

  const reportsByUser = new Map<
    string,
    {
      generated_at: string | null;
      generation_status: 'pending' | 'completed' | 'failed' | null;
      generation_attempts: number | null;
      pdf_path: string | null;
    }
  >();
  for (const r of reportsRes.data ?? []) {
    reportsByUser.set(r.user_id, {
      generated_at: r.generated_at,
      generation_status: r.generation_status as 'pending' | 'completed' | 'failed' | null,
      generation_attempts: r.generation_attempts,
      pdf_path: r.pdf_path,
    });
  }

  // Aggregate chat activity: count user-authored turns + track the latest message.
  const chatByUser = new Map<string, { userTurns: number; lastAt: string | null }>();
  for (const m of msgsRes.data ?? []) {
    const uid = m.user_id as string;
    const cur = chatByUser.get(uid) ?? { userTurns: 0, lastAt: null };
    if (m.role === 'user') cur.userTurns += 1;
    const ts = m.created_at as string | null;
    if (ts && (!cur.lastAt || ts > cur.lastAt)) cur.lastAt = ts;
    chatByUser.set(uid, cur);
  }

  const journeyByUser = new Map<string, { lastTopic: string | null; incomplete: number }>();
  for (const j of journeyRes.data ?? []) {
    journeyByUser.set(j.user_id as string, {
      lastTopic: (j.last_topic as string | null) ?? null,
      incomplete: (j.incomplete_count as number) ?? 0,
    });
  }

  const rows: MemberRow[] = (profilesRes.data ?? []).map((p) => {
    const auth = authByUser.get(p.user_id);
    const report = reportsByUser.get(p.user_id);
    const chat = chatByUser.get(p.user_id);
    const journey = journeyByUser.get(p.user_id);
    const score = scoreByUser.get(p.user_id);
    return {
      userId: p.user_id,
      name: p.name ?? '',
      email: auth?.email ?? '',
      phone: p.phone ?? '',
      categoryId: p.category ?? '',
      categoryLabel: CATEGORIES.find((c) => c.id === p.category)?.label ?? (p.category ?? ''),
      registeredAt: auth?.createdAt ?? null,
      assessmentSubmitted: submittedUsers.has(p.user_id),
      score: score?.overall ?? null,
      band: score?.band ?? null,
      aboutSummary: aboutByUser.get(p.user_id) ?? '',
      reportStatus: report?.generation_status ?? null,
      reportGeneratedAt: report?.generated_at ?? null,
      reportAttempts: report?.generation_attempts ?? 0,
      hasPdf: Boolean(report?.pdf_path),
      chatTurns: chat?.userTurns ?? 0,
      lastChatAt: chat?.lastAt ?? null,
      lastTopic: journey?.lastTopic ?? null,
    };
  });

  // Newest registrations first — the default "who just signed up" view.
  rows.sort((a, b) => {
    const aTs = a.registeredAt ? Date.parse(a.registeredAt) : 0;
    const bTs = b.registeredAt ? Date.parse(b.registeredAt) : 0;
    return bTs - aTs;
  });

  const stats = {
    total: rows.length,
    submitted: rows.filter((r) => r.assessmentSubmitted).length,
    chatted: rows.filter((r) => r.chatTurns > 0).length,
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-px" style={{ backgroundColor: '#1B4D3E' }} />
            <span
              className="font-display text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#1B4D3E' }}
            >
              Admin
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase tracking-wide text-3xl"
            style={{ color: '#2C2C2C' }}
          >
            Registered members
          </h1>
          <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
            Every registered user, newest first: when they signed up, whether
            they&apos;ve completed the eligibility check, their score and band,
            what they told us about themselves in their own words, their report
            status, and their chatbot activity. Hit <em>Summarise chats</em> on
            any member who&apos;s chatted
            to generate an on-demand summary of what they asked.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Registered" value={stats.total} />
          <StatCard label="Completed check" value={stats.submitted} />
          <StatCard label="Used chatbot" value={stats.chatted} />
        </div>

        <UsersDashboardClient rows={rows} />
      </div>
    </main>
  );
}
