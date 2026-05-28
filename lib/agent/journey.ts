import 'server-only';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { assessmentDataSchema, type AssessmentData } from '@/lib/assessments/schemas/assessment';
import {
  type Milestone,
  type MilestoneUpdate,
  applyMilestoneUpdates,
  recomputeDerived,
  seedJourneyFromAssessment,
} from './milestones';

export interface Journey {
  category: string;
  milestones: Milestone[];
  nextMilestoneKey: string | null;
  incompleteCount: number;
  lastTopic: string | null;
}

const LAST_TOPIC_MAX = 200;

interface JourneyRow {
  category: string;
  milestones: Milestone[];
  next_milestone_key: string | null;
  incomplete_count: number;
  last_topic: string | null;
}

function rowToJourney(row: JourneyRow): Journey {
  return {
    category: row.category,
    milestones: Array.isArray(row.milestones) ? row.milestones : [],
    nextMilestoneKey: row.next_milestone_key ?? null,
    incompleteCount: row.incomplete_count ?? 0,
    lastTopic: row.last_topic ?? null,
  };
}

async function readJourneyRow(
  svc: ReturnType<typeof createSupabaseServiceClient>,
  userId: string,
): Promise<Journey | null> {
  const { data: row } = await svc
    .from('user_journey')
    .select('category, milestones, next_milestone_key, incomplete_count, last_topic')
    .eq('user_id', userId)
    .maybeSingle();
  return row ? rowToJourney(row as JourneyRow) : null;
}

async function computeSeed(
  svc: ReturnType<typeof createSupabaseServiceClient>,
  userId: string,
  category: string,
): Promise<Journey> {
  const { data: assessment } = await svc
    .from('assessments')
    .select('data, schema_version')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('status', 'submitted')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let parsed: AssessmentData | null = null;
  if (assessment?.data) {
    try {
      parsed = assessmentDataSchema.parse(assessment.data);
    } catch {
      parsed = null;
    }
  }
  const schemaVersion = (assessment?.schema_version as number | undefined) ?? 0;
  const milestones = seedJourneyFromAssessment(category, parsed, schemaVersion);
  const { incompleteCount, nextMilestoneKey } = recomputeDerived(category, milestones);
  return { category, milestones, nextMilestoneKey, incompleteCount, lastTopic: null };
}

/**
 * Reads the user's journey, lazy-seeding AND PERSISTING it from their latest
 * submitted assessment on first access. Call from API routes only (it writes) —
 * never during server-component render. Use getJourneyForDisplay in render.
 */
export async function getJourney(userId: string, category: string): Promise<Journey> {
  const svc = createSupabaseServiceClient();
  const existing = await readJourneyRow(svc, userId);
  if (existing) return existing;

  const seed = await computeSeed(svc, userId, category);
  await svc.from('user_journey').upsert(
    {
      user_id: userId,
      category,
      milestones: seed.milestones,
      next_milestone_key: seed.nextMilestoneKey,
      incomplete_count: seed.incompleteCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  return seed;
}

/**
 * Read-only journey for rendering: returns the persisted row, or an in-memory
 * seed when none exists yet (no write). The seed is persisted later by the
 * client-fired /api/agent/touch on coach-page mount.
 */
export async function getJourneyForDisplay(userId: string, category: string): Promise<Journey> {
  const svc = createSupabaseServiceClient();
  const existing = await readJourneyRow(svc, userId);
  if (existing) return existing;
  return computeSeed(svc, userId, category);
}

/**
 * Validates + applies milestone updates from a chat turn (source='llm') or a
 * manual edit (source='manual'), recomputes the denormalised cron columns, and
 * persists. Optionally writes last_topic (chat path only). Returns the new state.
 */
export async function updateJourney(
  userId: string,
  category: string,
  updates: MilestoneUpdate[],
  source: 'llm' | 'manual',
  lastTopic?: string | null,
): Promise<Journey> {
  const svc = createSupabaseServiceClient();
  const current = await getJourney(userId, category);

  const milestones = applyMilestoneUpdates(category, current.milestones, updates, source);
  const { incompleteCount, nextMilestoneKey } = recomputeDerived(category, milestones);

  const patch: Record<string, unknown> = {
    milestones,
    next_milestone_key: nextMilestoneKey,
    incomplete_count: incompleteCount,
    updated_at: new Date().toISOString(),
  };
  if (lastTopic) patch.last_topic = lastTopic.slice(0, LAST_TOPIC_MAX);

  await svc.from('user_journey').update(patch).eq('user_id', userId);

  return {
    category,
    milestones,
    nextMilestoneKey,
    incompleteCount,
    lastTopic: lastTopic ?? current.lastTopic,
  };
}

export { milestonesForCategory } from './milestones';
