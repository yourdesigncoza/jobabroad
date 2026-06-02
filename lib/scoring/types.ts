export type Band = 'high_blockers' | 'needs_prep' | 'strong_potential';

export interface MatchRule {
  field_id: string;
  type: 'match';
  match: Record<string, number>;
  reason: Record<string, string>;
}

export interface RangeRule {
  field_id: string;
  type: 'range';
  ranges: Array<{ lt?: number; score: number; reason: string }>;
}

export interface PresentRule {
  field_id: string;
  type: 'present';
  score: number;
  reason: { present: string; absent: string };
}

export interface CountRule {
  field_id: string;
  type: 'count';
  per_item: number;
  max: number;
  reason: string;
}

/**
 * Scores the SINGLE highest-value option the applicant holds, not the sum.
 *
 * - `field_id`: one multi-select field (e.g. subject specialisms, trade tickets)
 *   — rewards holding at least one in-demand option without penalising breadth.
 * - `field_ids`: several single-select fields read together, taking the best
 *   across all of them (e.g. destination credential assessments — an engineer
 *   only progresses the assessor for where they're going, so "best across EA /
 *   ENZ / Ecctis / WES" reflects their actual target). Options not in `match`
 *   (e.g. "Not applying to Australia") simply don't contribute.
 *
 * Provide exactly one of `field_id` / `field_ids`. `empty_reason` is used when
 * nothing was selected or no selection matches the map.
 */
export interface BestMatchRule {
  field_id?: string;
  field_ids?: string[];
  type: 'best_match';
  match: Record<string, number>;
  reason: Record<string, string>;
  empty_reason: string;
}

export type Rule = MatchRule | RangeRule | PresentRule | CountRule | BestMatchRule;

export interface Dimension {
  key: string;
  label: string;
  weight: number;
  rules: Rule[];
}

/**
 * A critical-fail gate. Scoring is a weighted average, so a strong applicant can
 * mask an absolute blocker — e.g. a nurse with "Basic" English averaging into
 * strong_potential even though no overseas council will register them. A cap
 * clamps the band to no higher than `max_band` whenever the named field holds
 * one of `when_value`, regardless of the weighted total. The numeric score is
 * left untouched (the score page still shows the real number); only the band is
 * lowered, and the cap's `reason` explains why.
 */
export interface BandCap {
  field_id: string;
  /** Field values that trip the cap (exact option strings, or "true"/"false"). */
  when_value: string[];
  /** Highest band the applicant can reach while this field is tripped. */
  max_band: Band;
  /** User-facing explanation, surfaced on the score page and in the report. */
  reason: string;
}

export interface Rubric {
  category: string;
  version: number;
  bands?: { high_blockers_lt: number; needs_prep_lt: number };
  caps?: BandCap[];
  dimensions: Dimension[];
}

export interface ContributingRow {
  field_id: string;
  value: unknown;
  points: number;
  max_points: number;
  reason: string;
}

export interface DimensionResult {
  key: string;
  label: string;
  weight: number;
  score: number;
  contributing: ContributingRow[];
}

export interface AppliedCap {
  field_id: string;
  value: unknown;
  max_band: Band;
  reason: string;
}

export interface ScoreResult {
  overall: number;
  band: Band;
  dimensions: DimensionResult[];
  /** Caps that tripped and lowered the band. Empty/absent when none fired. */
  applied_caps?: AppliedCap[];
}
