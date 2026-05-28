// Pure milestone logic — no server-only, no DB. Kept separate from journey.ts
// so it can be unit-tested in plain Node.
import type { AssessmentData } from '@/lib/assessments/schemas/assessment';
import { SCHEMA_VERSION } from '@/lib/assessments/types';

export type MilestoneStatus = 'not_started' | 'in_progress' | 'done';
export type MilestoneSource = 'seed' | 'llm' | 'manual';

export const STATUS_RANK: Record<MilestoneStatus, number> = {
  not_started: 0,
  in_progress: 1,
  done: 2,
};

function isStatus(s: unknown): s is MilestoneStatus {
  return s === 'not_started' || s === 'in_progress' || s === 'done';
}

export interface Milestone {
  key: string;
  label: string;
  status: MilestoneStatus;
  source: MilestoneSource;
  updated_by: MilestoneSource;
  updated_at: string;
}

export interface MilestoneDef {
  key: string;
  label: string;
}

export interface MilestoneUpdate {
  key: string;
  status: MilestoneStatus;
}

// Teaching is the only paid pilot category. Others return null (mirrors the
// rubric pattern — no milestone model yet).
export const TEACHING_MILESTONES: MilestoneDef[] = [
  { key: 'passport', label: 'Valid passport' },
  { key: 'english_test', label: 'English language test' },
  { key: 'sace_registration', label: 'SACE registration' },
  { key: 'qts_route', label: 'Overseas teacher registration (QTS / iQTS)' },
  { key: 'police_clearance', label: 'Police clearance' },
  { key: 'sponsor_secured', label: 'School / sponsor secured' },
  { key: 'visa_application', label: 'Visa application' },
  { key: 'relocation_logistics', label: 'Relocation logistics' },
];

const MILESTONES_BY_CATEGORY: Record<string, MilestoneDef[]> = {
  teaching: TEACHING_MILESTONES,
};

export function milestonesForCategory(category: string): MilestoneDef[] | null {
  return MILESTONES_BY_CATEGORY[category] ?? null;
}

function answerString(data: AssessmentData, key: string): string {
  const e = data[key];
  if (!e) return '';
  if (typeof e.v === 'string') return e.v;
  if (Array.isArray(e.v)) return e.v.join(',');
  return String(e.v);
}

// Maps the teaching schema v1 assessment answers to initial milestone statuses.
function seedTeachingV1(data: AssessmentData): Record<string, MilestoneStatus> {
  const out: Record<string, MilestoneStatus> = {};

  const passport = answerString(data, 'documents.passport_status');
  out.passport = passport.startsWith('Valid')
    ? 'done'
    : passport === 'Expired'
      ? 'in_progress'
      : 'not_started';

  const eng = answerString(data, 'readiness.english_test');
  out.english_test =
    eng === 'IELTS' || eng === 'TOEFL' || eng === 'Other / exempt'
      ? 'done'
      : 'not_started';

  const sace = answerString(data, 'registration.sace_status');
  out.sace_registration =
    sace === 'Active (full)'
      ? 'done'
      : sace === 'Provisional' || sace === 'Pending renewal'
        ? 'in_progress'
        : 'not_started';

  const qts = answerString(data, 'registration.qts_started');
  out.qts_route =
    qts === 'Completed' ? 'done' : qts === 'In progress' ? 'in_progress' : 'not_started';

  const police = answerString(data, 'documents.police_clearance');
  out.police_clearance =
    police === 'Current (within 6 months)'
      ? 'done'
      : police === 'Older than 6 months'
        ? 'in_progress'
        : 'not_started';

  // sponsor_secured, visa_application, relocation_logistics: no assessment
  // signal — default not_started.
  return out;
}

/**
 * Builds the initial milestone list for a user from their submitted assessment.
 * Branches by schema_version: an unknown version (or missing/unknown category
 * or data) falls back to all-`not_started` rather than mis-seeding.
 */
export function seedJourneyFromAssessment(
  category: string,
  data: AssessmentData | null,
  schemaVersion: number,
): Milestone[] {
  const defs = milestonesForCategory(category);
  if (!defs) return [];

  let statusMap: Record<string, MilestoneStatus> = {};
  if (data && category === 'teaching' && schemaVersion === SCHEMA_VERSION) {
    statusMap = seedTeachingV1(data);
  }

  const now = new Date().toISOString();
  return defs.map((d) => ({
    key: d.key,
    label: d.label,
    status: statusMap[d.key] ?? 'not_started',
    source: 'seed',
    updated_by: 'seed',
    updated_at: now,
  }));
}

/**
 * Validates and applies milestone status changes.
 * - rejects unknown keys (no hallucinated milestones) and bad statuses
 * - LLM updates are monotonic-forward only and may advance at most to
 *   `in_progress` — `done` is reserved for an explicit user statement (handled
 *   upstream) or a manual toggle, so the model can't mark a doc done just
 *   because the user asked about it
 * - manual updates may set any valid status, including regressions
 */
export function applyMilestoneUpdates(
  category: string,
  milestones: Milestone[],
  updates: MilestoneUpdate[],
  source: 'llm' | 'manual',
): Milestone[] {
  const defs = milestonesForCategory(category);
  if (!defs) return milestones;
  const validKeys = new Set(defs.map((d) => d.key));
  const now = new Date().toISOString();
  const next = milestones.map((m) => ({ ...m }));

  for (const u of updates) {
    if (!u || !validKeys.has(u.key) || !isStatus(u.status)) continue;
    const idx = next.findIndex((m) => m.key === u.key);
    if (idx === -1) continue;
    const current = next[idx];

    let status = u.status;
    if (source === 'llm') {
      if (status === 'done') status = 'in_progress';
      // monotonic forward only
      if (STATUS_RANK[status] <= STATUS_RANK[current.status]) continue;
    }

    next[idx] = { ...current, status, updated_by: source, updated_at: now };
  }

  return next;
}

export function recomputeDerived(
  category: string,
  milestones: Milestone[],
): { incompleteCount: number; nextMilestoneKey: string | null } {
  const defs = milestonesForCategory(category) ?? [];
  let incompleteCount = 0;
  let nextMilestoneKey: string | null = null;
  for (const d of defs) {
    const m = milestones.find((x) => x.key === d.key);
    if (!m || m.status !== 'done') {
      incompleteCount++;
      if (!nextMilestoneKey) nextMilestoneKey = d.key;
    }
  }
  return { incompleteCount, nextMilestoneKey };
}

export function milestoneLabel(category: string, key: string | null): string | null {
  if (!key) return null;
  return milestonesForCategory(category)?.find((d) => d.key === key)?.label ?? null;
}
