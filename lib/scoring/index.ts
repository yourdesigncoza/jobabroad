import type { AssessmentData } from '@/lib/assessments/schemas/assessment';
import type {
  AppliedCap,
  Band,
  ContributingRow,
  Dimension,
  DimensionResult,
  Rubric,
  Rule,
  ScoreResult,
} from './types';

const DEFAULT_BANDS = { high_blockers_lt: 40, needs_prep_lt: 70 };

// Lower rank = more restrictive. A cap clamps the band to min(current, max_band).
const BAND_RANK: Record<Band, number> = {
  high_blockers: 0,
  needs_prep: 1,
  strong_potential: 2,
};

export async function loadRubric(category: string): Promise<Rubric | null> {
  // Explicit static imports (not a template-literal path) so the bundler can
  // see every rubric at build time. One case per category that has a rubric.
  switch (category) {
    case 'teaching':
      return (await import('./rubrics/teaching.json')).default as Rubric;
    case 'healthcare':
      return (await import('./rubrics/healthcare.json')).default as Rubric;
    case 'engineering':
      return (await import('./rubrics/engineering.json')).default as Rubric;
    case 'it-tech':
      return (await import('./rubrics/it-tech.json')).default as Rubric;
    case 'trades':
      return (await import('./rubrics/trades.json')).default as Rubric;
    case 'tefl':
      return (await import('./rubrics/tefl.json')).default as Rubric;
    case 'hospitality':
      return (await import('./rubrics/hospitality.json')).default as Rubric;
    case 'farming':
      return (await import('./rubrics/farming.json')).default as Rubric;
    case 'seasonal':
      return (await import('./rubrics/seasonal.json')).default as Rubric;
    case 'au-pair':
      return (await import('./rubrics/au-pair.json')).default as Rubric;
    case 'accounting':
      return (await import('./rubrics/accounting.json')).default as Rubric;
    default:
      return null;
  }
}

export function calculateScore(answers: AssessmentData, rubric: Rubric): ScoreResult {
  const dimensions = rubric.dimensions.map((d) => evaluateDimension(d, answers));

  const weighted = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  const overall = clamp(weighted, 0, 100);

  const bands = rubric.bands ?? DEFAULT_BANDS;
  let band: Band =
    overall < bands.high_blockers_lt
      ? 'high_blockers'
      : overall < bands.needs_prep_lt
        ? 'needs_prep'
        : 'strong_potential';

  // Band-capping: a critical-fail field (e.g. no passport, Basic English for a
  // nurse) clamps the band down regardless of the weighted total. The numeric
  // score is left as-is; only the band is lowered.
  const applied_caps: AppliedCap[] = [];
  for (const cap of rubric.caps ?? []) {
    const value = answers[cap.field_id]?.v;
    const key = value == null ? '' : String(value);
    if (!cap.when_value.includes(key)) continue;
    applied_caps.push({
      field_id: cap.field_id,
      value: value ?? null,
      max_band: cap.max_band,
      reason: cap.reason,
    });
    if (BAND_RANK[cap.max_band] < BAND_RANK[band]) band = cap.max_band;
  }

  return {
    overall: Math.round(overall),
    band,
    dimensions,
    ...(applied_caps.length ? { applied_caps } : {}),
  };
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
  // best_match may carry field_ids instead of a single field_id (handled in its
  // own branch); every other rule type has a required field_id.
  const value = rule.field_id != null ? answers[rule.field_id]?.v : undefined;

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

    case 'best_match': {
      const maxPoints = Math.max(0, ...Object.values(rule.match));
      // Gather candidate values: either one multi-select field's array, or a set
      // of single-select fields read together (field_ids). Both collapse to a
      // flat list of selected option strings, from which we pick the best.
      const fieldIds = rule.field_ids ?? (rule.field_id ? [rule.field_id] : []);
      const primaryFieldId = rule.field_id ?? fieldIds[0] ?? '';
      const selected = fieldIds.flatMap((fid) => {
        const v = answers[fid]?.v;
        if (Array.isArray(v)) return v.map(String);
        return v != null && v !== '' ? [String(v)] : [];
      });
      // Pick the single highest-scoring selected option that the map knows.
      let bestPoints = -1;
      let bestKey = '';
      for (const item of selected) {
        const p = rule.match[item];
        if (p !== undefined && p > bestPoints) {
          bestPoints = p;
          bestKey = item;
        }
      }
      if (bestPoints < 0) {
        return {
          field_id: primaryFieldId,
          value: selected.length ? selected : null,
          points: 0,
          max_points: maxPoints,
          reason: rule.empty_reason,
        };
      }
      return {
        field_id: primaryFieldId,
        value: selected,
        points: bestPoints,
        max_points: maxPoints,
        reason: rule.reason[bestKey] ?? rule.empty_reason,
      };
    }
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
