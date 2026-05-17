import type { AssessmentData } from '@/lib/assessments/schemas/assessment';
import type {
  Band,
  ContributingRow,
  Dimension,
  DimensionResult,
  Rubric,
  Rule,
  ScoreResult,
} from './types';

const DEFAULT_BANDS = { high_blockers_lt: 40, needs_prep_lt: 70 };

export async function loadRubric(category: string): Promise<Rubric | null> {
  switch (category) {
    case 'teaching':
      return (await import('./rubrics/teaching.json')).default as Rubric;
    default:
      return null;
  }
}

export function calculateScore(answers: AssessmentData, rubric: Rubric): ScoreResult {
  const dimensions = rubric.dimensions.map((d) => evaluateDimension(d, answers));

  const weighted = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  const overall = clamp(weighted, 0, 100);

  const bands = rubric.bands ?? DEFAULT_BANDS;
  const band: Band =
    overall < bands.high_blockers_lt
      ? 'high_blockers'
      : overall < bands.needs_prep_lt
        ? 'needs_prep'
        : 'strong_potential';

  return { overall: Math.round(overall), band, dimensions };
}

function evaluateDimension(dim: Dimension, answers: AssessmentData): DimensionResult {
  const contributing = dim.rules.map((rule) => evaluateRule(rule, answers));
  const totalPoints = contributing.reduce((s, c) => s + c.points, 0);
  const totalMax = contributing.reduce((s, c) => s + c.max_points, 0);
  const score = totalMax > 0 ? clamp((totalPoints / totalMax) * 100, 0, 100) : 0;
  return {
    key: dim.key,
    label: dim.label,
    weight: dim.weight,
    score: Math.round(score),
    contributing,
  };
}

function evaluateRule(rule: Rule, answers: AssessmentData): ContributingRow {
  const entry = answers[rule.field_id];
  const value = entry?.v;

  switch (rule.type) {
    case 'match': {
      const maxPoints = Math.max(0, ...Object.values(rule.match));
      const key = value == null ? '' : String(value);
      const points = rule.match[key] ?? 0;
      const reason =
        rule.reason[key] ?? `Not enough information for this rule yet.`;
      return {
        field_id: rule.field_id,
        value: value ?? null,
        points,
        max_points: maxPoints,
        reason,
      };
    }

    case 'range': {
      const maxPoints = Math.max(0, ...rule.ranges.map((r) => r.score));
      const numeric = typeof value === 'number' ? value : Number(value);
      if (Number.isNaN(numeric)) {
        return {
          field_id: rule.field_id,
          value: value ?? null,
          points: 0,
          max_points: maxPoints,
          reason: 'No numeric value recorded.',
        };
      }
      const fallback = rule.ranges[rule.ranges.length - 1] ?? {
        score: 0,
        reason: 'No range matched.',
      };
      const chosen =
        rule.ranges.find((r) => r.lt === undefined || numeric < r.lt) ?? fallback;
      return {
        field_id: rule.field_id,
        value: numeric,
        points: chosen.score,
        max_points: maxPoints,
        reason: chosen.reason,
      };
    }

    case 'present': {
      const isPresent =
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0);
      return {
        field_id: rule.field_id,
        value: value ?? null,
        points: isPresent ? rule.score : 0,
        max_points: rule.score,
        reason: isPresent ? rule.reason.present : rule.reason.absent,
      };
    }

    case 'count': {
      const arr = Array.isArray(value) ? value : [];
      const raw = arr.length * rule.per_item;
      const points = Math.min(raw, rule.max);
      return {
        field_id: rule.field_id,
        value: arr,
        points,
        max_points: rule.max,
        reason: rule.reason,
      };
    }
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
