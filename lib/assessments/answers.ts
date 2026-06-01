import type { AssessmentData } from './schemas/assessment';

/** Reads a multi-select answer by field-id suffix, regardless of the step-slug
 *  prefix the category happens to use (e.g. `readiness.target_destinations`,
 *  `goals.target_destinations`). Returns [] when absent or blank. */
function readMultiBySuffix(answers: AssessmentData, suffix: string): string[] {
  const entry = Object.entries(answers).find(([k]) => k.endsWith(suffix))?.[1];
  if (!entry) return [];
  if (Array.isArray(entry.v)) return entry.v.map(String).filter(Boolean);
  if (typeof entry.v === 'string' && entry.v.trim()) return [entry.v.trim()];
  return [];
}

/** The applicant's target destinations. Vertical-agnostic. */
export function readTargetDestinations(answers: AssessmentData): string[] {
  return readMultiBySuffix(answers, 'target_destinations');
}

/** The applicant's specialism/discipline selection — the field that drives the
 *  "demand" scoring dimension. Vertical-agnostic: matches the first field whose
 *  id ends in one of the known demand-field suffixes used across the verticals
 *  (subjects, speciality, discipline, occupation, sector, primary_role, etc.).
 *  Feeds only the cosmetic "Specialism" line on the report — never scoring. */
export function readSpecialisms(answers: AssessmentData): string[] {
  const suffixes = [
    'subjects',
    'specialisms',
    'specialism',
    'speciality',
    'disciplines',
    'discipline',
    'occupation',
    'primary_role',
    'experience_types',
    'sector',
    'trades',
  ];
  for (const suffix of suffixes) {
    const hit = readMultiBySuffix(answers, suffix);
    if (hit.length) return hit;
  }
  return [];
}
