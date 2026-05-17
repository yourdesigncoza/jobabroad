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

export type Rule = MatchRule | RangeRule | PresentRule | CountRule;

export interface Dimension {
  key: string;
  label: string;
  weight: number;
  rules: Rule[];
}

export interface Rubric {
  category: string;
  version: number;
  bands?: { high_blockers_lt: number; needs_prep_lt: number };
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

export interface ScoreResult {
  overall: number;
  band: Band;
  dimensions: DimensionResult[];
}
