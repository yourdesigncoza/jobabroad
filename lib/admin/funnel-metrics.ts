import 'server-only';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { CATEGORIES } from '@/lib/categories';

export type CategoryStat = { id: string; label: string; count: number; share: number };

export type FunnelStage = {
  key: string;
  label: string;
  count: number;
  /** Share of the top-of-funnel (registered) total, 0–100. */
  pctOfRegistered: number;
  /** Conversion from the previous stage, 0–100 (null for the first stage). */
  pctOfPrev: number | null;
};

export type FunnelMetrics = {
  generatedAt: string;
  users: { total: number; confirmed: number; unconfirmed: number };
  tier: { free: number; paid: number; other: number };
  assessments: {
    total: number;
    submitted: number;
    draft: number;
    startedUsers: number;
    submittedUsers: number;
  };
  bookings: number;
  reports: { rows: number; withPdf: number; completed: number; pending: number; failed: number };
  storageObjects: number;
  byCategory: CategoryStat[];
  funnel: FunnelStage[];
};

/** Page through the auth admin API so the count stays right as users grow. */
async function fetchAllAuthUsers(svc: ReturnType<typeof createSupabaseServiceClient>) {
  const perPage = 200;
  const all: Array<{ email_confirmed_at?: string | null; confirmed_at?: string | null }> = [];
  for (let page = 1; page < 50; page++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage });
    const users = data?.users ?? [];
    if (error || users.length === 0) break;
    all.push(...users);
    if (users.length < perPage) break;
  }
  return all;
}

/** Count objects in the per-user folders under the paid-reports bucket. */
async function countStorageObjects(svc: ReturnType<typeof createSupabaseServiceClient>) {
  const { data: roots } = await svc.storage.from('paid-reports').list('', { limit: 1000 });
  let total = 0;
  for (const top of roots ?? []) {
    const { data: inner } = await svc.storage.from('paid-reports').list(top.name, { limit: 1000 });
    total += inner?.length ?? 0;
  }
  return total;
}

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

/**
 * Single source of truth for the admin funnel dashboard. Mirrors the ad-hoc
 * numbers we were pulling by hand (scripts/inventory-users.ts) so the dashboard
 * and any script report the same thing.
 */
export async function getFunnelMetrics(): Promise<FunnelMetrics> {
  const svc = createSupabaseServiceClient();

  const [authUsers, profilesRes, assessRes, bookingsRes, reportsRes, storageObjects] =
    await Promise.all([
      fetchAllAuthUsers(svc),
      svc.from('profiles').select('category, tier'),
      svc.from('assessments').select('user_id, status'),
      svc.from('bookings').select('id', { count: 'exact', head: true }),
      svc.from('paid_reports').select('generation_status, pdf_path'),
      countStorageObjects(svc),
    ]);

  // Users
  const total = authUsers.length;
  const confirmed = authUsers.filter((u) => u.email_confirmed_at || u.confirmed_at).length;

  // Tier split (profiles is the registered-user spine)
  const profiles = profilesRes.data ?? [];
  const registered = profiles.length || total; // fall back to auth count if needed
  let free = 0;
  let paid = 0;
  let otherTier = 0;
  const catCount = new Map<string, number>();
  for (const p of profiles) {
    if (p.tier === 'paid') paid++;
    else if (p.tier === 'free' || p.tier == null) free++;
    else otherTier++;
    const c = (p.category as string) || 'unknown';
    catCount.set(c, (catCount.get(c) ?? 0) + 1);
  }

  // Assessments
  const assessments = assessRes.data ?? [];
  let submitted = 0;
  let draft = 0;
  const startedUsers = new Set<string>();
  const submittedUsers = new Set<string>();
  for (const a of assessments) {
    const uid = a.user_id as string;
    startedUsers.add(uid);
    if (a.status === 'submitted') {
      submitted++;
      submittedUsers.add(uid);
    } else if (a.status === 'draft') {
      draft++;
    }
  }

  // Bookings
  const bookings = bookingsRes.count ?? 0;

  // Reports
  const reportRows = reportsRes.data ?? [];
  const reports = {
    rows: reportRows.length,
    withPdf: reportRows.filter((r) => r.pdf_path).length,
    completed: reportRows.filter((r) => r.generation_status === 'completed').length,
    pending: reportRows.filter((r) => r.generation_status === 'pending').length,
    failed: reportRows.filter((r) => r.generation_status === 'failed').length,
  };

  // By category — known categories first (in CATEGORIES order), then any stragglers.
  const byCategory: CategoryStat[] = [];
  const seen = new Set<string>();
  for (const c of CATEGORIES) {
    const count = catCount.get(c.id) ?? 0;
    if (count === 0) continue;
    seen.add(c.id);
    byCategory.push({ id: c.id, label: c.label, count, share: pct(count, registered) });
  }
  for (const [id, count] of catCount) {
    if (seen.has(id)) continue;
    byCategory.push({ id, label: id, count, share: pct(count, registered) });
  }
  byCategory.sort((a, b) => b.count - a.count);

  // Funnel chain — counts at each stage + conversion vs registered and vs prev.
  // Order reflects the real flow: payment flips the tier, then the Cal.com call
  // is an optional post-payment step (not a gate) — so "Booked" sits after "Paid".
  const stageCounts: Array<{ key: string; label: string; count: number }> = [
    { key: 'registered', label: 'Registered', count: registered },
    { key: 'confirmed', label: 'Confirmed email', count: confirmed },
    { key: 'started', label: 'Started assessment', count: startedUsers.size },
    { key: 'submitted', label: 'Submitted assessment', count: submittedUsers.size },
    { key: 'paid', label: 'Paid', count: paid },
    { key: 'booked', label: 'Booked a call (optional)', count: bookings },
  ];
  const top = stageCounts[0].count;
  const funnel: FunnelStage[] = stageCounts.map((s, i) => ({
    ...s,
    pctOfRegistered: pct(s.count, top),
    pctOfPrev: i === 0 ? null : pct(s.count, stageCounts[i - 1].count),
  }));

  return {
    generatedAt: new Date().toISOString(),
    users: { total, confirmed, unconfirmed: total - confirmed },
    tier: { free, paid, other: otherTier },
    assessments: {
      total: assessments.length,
      submitted,
      draft,
      startedUsers: startedUsers.size,
      submittedUsers: submittedUsers.size,
    },
    bookings,
    reports,
    storageObjects,
    byCategory,
    funnel,
  };
}
