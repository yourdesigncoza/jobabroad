import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import { calculateScore } from '@/lib/scoring';
import type { Rubric } from '@/lib/scoring/types';
import { readSpecialisms, readTargetDestinations } from '@/lib/assessments/answers';
import type { AssessmentData } from '@/lib/assessments/schemas/assessment';

// Pure-logic regression for the rubric engine — no browser, no network. Pins
// the `best_match` rule type and the teaching "Subject Demand" dimension that
// rewards shortage subjects. The rubric is read from disk (not via loadRubric's
// dynamic JSON import) so the Playwright ESM loader doesn't need a JSON import
// attribute; the app path is unaffected.
function teachingRubric(): Rubric {
  return JSON.parse(
    readFileSync(join(process.cwd(), 'lib/scoring/rubrics/teaching.json'), 'utf8'),
  ) as Rubric;
}

const BASE: AssessmentData = {
  'qualifications.highest_qualification': { q: 'Qual', v: 'B.Ed Honours' },
  'registration.sace_status': { q: 'SACE', v: 'Active (full)' },
  'registration.qts_started': { q: 'QTS', v: 'Completed' },
  'experience.years_teaching': { q: 'Years', v: 6 },
  'experience.taught_abroad': { q: 'Abroad', v: true },
  'readiness.english_rating': { q: 'Eng', v: 'Native / first language' },
  'readiness.english_test': { q: 'Test', v: 'IELTS' },
  'documents.passport_status': { q: 'PP', v: 'Valid, 2+ years remaining' },
  'documents.police_clearance': { q: 'PCC', v: 'Current (within 6 months)' },
  'documents.available_capital': { q: 'Cap', v: 'R150k+' },
  'situation.family_status': { q: 'Fam', v: 'Single, no dependants' },
  'readiness.target_timeline': { q: 'When', v: 'As soon as possible' },
  'readiness.target_destinations': { q: 'Where', v: ['UAE', 'UK'] },
};

test('teaching rubric weights sum to 1', async () => {
  const rubric = teachingRubric();
  const sum = rubric.dimensions.reduce((t, d) => t + d.weight, 0);
  expect(Math.abs(sum - 1)).toBeLessThan(1e-6);
});

test('best_match scores the single highest-demand specialism', async () => {
  const rubric = teachingRubric();

  const stem = calculateScore({ ...BASE, 'qualifications.subjects': { q: 'S', v: ['Maths', 'Arts / Music'] } }, rubric);
  const arts = calculateScore({ ...BASE, 'qualifications.subjects': { q: 'S', v: ['Arts / Music'] } }, rubric);
  const none = calculateScore(BASE, rubric);

  const spec = (r: typeof stem) => r.dimensions.find((d) => d.key === 'specialism')!;

  // Mixed selection takes the BEST option (Maths 100), not an average.
  expect(spec(stem).score).toBe(100);
  expect(spec(arts).score).toBe(45);
  // Nothing selected → 0 with the guidance reason, not a crash.
  expect(spec(none).score).toBe(0);
  expect(spec(none).contributing[0]!.reason).toMatch(/shortage subjects/i);

  // Subject demand moves the overall score materially.
  expect(stem.overall).toBeGreaterThan(arts.overall);
  expect(arts.overall).toBeGreaterThan(none.overall);
});

test('answer helpers read destinations + specialisms by field-id suffix', async () => {
  expect(readTargetDestinations(BASE)).toEqual(['UAE', 'UK']);
  expect(readSpecialisms({ ...BASE, 'qualifications.subjects': { q: 'S', v: ['Maths'] } })).toEqual(['Maths']);
});
