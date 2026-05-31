import type { Metadata } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { requireAdmin } from '@/lib/auth-guards';
import { CATEGORIES } from '@/lib/categories';
import PostCallClient, { type PaidUserRow } from './PostCallClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin · Post-call reports',
  robots: { index: false, follow: false },
};

export default async function PostCallAdminPage() {
  await requireAdmin('/admin/post-call');

  const svc = createSupabaseServiceClient();

  // Members who have completed the eligibility check (submitted an assessment).
  // The report auto-generates on submit, so this is the set worth reviewing and
  // adding notes to — not the old tier='paid' set (payments are shelved).
  const { data: submitted } = await svc
    .from('assessments')
    .select('user_id')
    .eq('status', 'submitted');
  const userIds = [...new Set((submitted ?? []).map((a) => a.user_id as string))];
  const idFilter = userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'];

  const [profilesRes, reportsRes, authRes] = await Promise.all([
    svc
      .from('profiles')
      .select('user_id, name, category, tier')
      .in('user_id', idFilter),
    svc
      .from('paid_reports')
      .select('user_id, generated_at, call_notes, generation_status, generation_attempts, pdf_path')
      .in('user_id', idFilter),
    svc.auth.admin.listUsers(),
  ]);
  const profiles = profilesRes.data;

  const reportsByUser = new Map<
    string,
    {
      generated_at: string | null;
      call_notes: string | null;
      generation_status: 'pending' | 'completed' | 'failed' | null;
      generation_attempts: number | null;
      pdf_path: string | null;
    }
  >();
  for (const r of reportsRes.data ?? []) {
    reportsByUser.set(r.user_id, {
      generated_at: r.generated_at,
      call_notes: r.call_notes,
      generation_status: r.generation_status as 'pending' | 'completed' | 'failed' | null,
      generation_attempts: r.generation_attempts,
      pdf_path: r.pdf_path,
    });
  }

  const emailByUser = new Map<string, string>();
  for (const u of authRes.data?.users ?? []) {
    if (u.id && u.email) emailByUser.set(u.id, u.email);
  }

  const rows: PaidUserRow[] = (profiles ?? []).map((p) => {
    const report = reportsByUser.get(p.user_id);
    return {
      userId: p.user_id,
      name: p.name ?? '',
      email: emailByUser.get(p.user_id) ?? '',
      categoryId: p.category ?? '',
      categoryLabel:
        CATEGORIES.find((c) => c.id === p.category)?.label ?? (p.category ?? ''),
      reportGeneratedAt: report?.generated_at ?? null,
      callNotes: report?.call_notes ?? '',
      generationStatus: report?.generation_status ?? null,
      generationAttempts: report?.generation_attempts ?? 0,
      hasPdf: Boolean(report?.pdf_path),
    };
  });

  // Sort: members whose report is ready but still has no notes first (they need
  // attention), then everyone else by most recent report.
  rows.sort((a, b) => {
    const aNeeds = a.reportGeneratedAt && !a.callNotes.trim() ? 0 : 1;
    const bNeeds = b.reportGeneratedAt && !b.callNotes.trim() ? 0 : 1;
    if (aNeeds !== bNeeds) return aNeeds - bNeeds;
    const aTs = a.reportGeneratedAt ? Date.parse(a.reportGeneratedAt) : 0;
    const bTs = b.reportGeneratedAt ? Date.parse(b.reportGeneratedAt) : 0;
    return bTs - aTs;
  });

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
            Member reports &amp; notes
          </h1>
          <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
            One row per member who&apos;s completed the eligibility check. Reports
            auto-generate when they submit. Paste your notes and click <em>Save
            notes &amp; email</em> — the member gets a plain-text follow-up email
            and the notes appear on their dashboard. <em>Force regenerate</em> is
            an escape hatch for stuck failures or post-template-change re-runs;
            it bypasses the 5-attempt user cap.
          </p>
        </div>

        <PostCallClient rows={rows} />
      </div>
    </main>
  );
}
