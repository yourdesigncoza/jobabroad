// Export every registered user to a timestamped backup (CSV + JSON) under
// docs/user-backups/. Read-only. Joins auth (email/created/confirmed) +
// profiles (name/phone/category/tier) + latest assessment status.
//
// docs/user-backups/ is gitignored — it holds real user PII, keep it out of git.
//
// Run: NODE_OPTIONS="--require ./scripts/shim-server-only.cjs" \
//        npx tsx scripts/backup-users.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { CATEGORIES } from '@/lib/categories';

type Row = {
  created_at: string | null;
  name: string;
  email: string;
  phone: string;
  category: string;
  category_label: string;
  confirmed: boolean;
  tier: string;
  assessment_status: 'none' | 'draft' | 'submitted';
};

function csvCell(v: unknown): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  const svc = createSupabaseServiceClient();

  const [authRes, profilesRes, assessRes] = await Promise.all([
    svc.auth.admin.listUsers({ perPage: 500 }),
    svc.from('profiles').select('user_id, name, phone, category, tier'),
    svc.from('assessments').select('user_id, status'),
  ]);

  const authById = new Map<string, { email: string; created: string | null; confirmed: boolean }>();
  for (const u of authRes.data?.users ?? []) {
    authById.set(u.id, {
      email: u.email ?? '',
      created: u.created_at ?? null,
      confirmed: Boolean(u.email_confirmed_at || u.confirmed_at),
    });
  }

  // Best assessment status per user (submitted beats draft beats none).
  const statusById = new Map<string, 'none' | 'draft' | 'submitted'>();
  for (const a of assessRes.data ?? []) {
    const uid = a.user_id as string;
    const cur = statusById.get(uid) ?? 'none';
    const next = a.status as 'draft' | 'submitted';
    if (next === 'submitted' || (next === 'draft' && cur === 'none')) statusById.set(uid, next);
  }

  const rows: Row[] = (profilesRes.data ?? []).map((p) => {
    const auth = authById.get(p.user_id);
    return {
      created_at: auth?.created ?? null,
      name: (p.name as string) ?? '',
      email: auth?.email ?? '',
      phone: (p.phone as string) ?? '',
      category: (p.category as string) ?? '',
      category_label: CATEGORIES.find((c) => c.id === p.category)?.label ?? (p.category as string) ?? '',
      confirmed: auth?.confirmed ?? false,
      tier: (p.tier as string) ?? 'free',
      assessment_status: statusById.get(p.user_id) ?? 'none',
    };
  });

  rows.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));

  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = join(process.cwd(), 'docs/user-backups');
  mkdirSync(outDir, { recursive: true });

  const header = ['created_at', 'name', 'email', 'phone', 'category', 'category_label', 'confirmed', 'tier', 'assessment_status'];
  const csv = [
    header.join(','),
    ...rows.map((r) => header.map((h) => csvCell((r as Record<string, unknown>)[h])).join(',')),
  ].join('\n');

  const csvPath = join(outDir, `users-${stamp}.csv`);
  const jsonPath = join(outDir, `users-${stamp}.json`);
  writeFileSync(csvPath, csv + '\n');
  writeFileSync(jsonPath, JSON.stringify(rows, null, 2));

  const confirmed = rows.filter((r) => r.confirmed).length;
  const submitted = rows.filter((r) => r.assessment_status === 'submitted').length;
  console.log(`backed up ${rows.length} users (${confirmed} confirmed · ${submitted} submitted assessment)`);
  console.log('  ', csvPath);
  console.log('  ', jsonPath);
}

main().catch((e) => { console.error(e); process.exit(1); });
