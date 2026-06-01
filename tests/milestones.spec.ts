import { test, expect } from '@playwright/test';
import {
  seedJourneyFromAssessment,
  milestonesForCategory,
  recomputeDerived,
} from '@/lib/agent/milestones';
import { getStepsForCategory } from '@/lib/assessments/steps';
import type { AssessmentData } from '@/lib/assessments/schemas/assessment';

// Pure-logic regression for the per-vertical journey models — no browser/network.

const CATEGORIES = [
  'teaching', 'healthcare', 'engineering', 'it-tech', 'trades',
  'tefl', 'hospitality', 'farming', 'seasonal', 'au-pair', 'accounting',
];

// First-option-of-each-field profile — deterministic and valid for any vertical.
function fixture(category: string): AssessmentData {
  const data: AssessmentData = {};
  for (const step of getStepsForCategory(category)!) {
    for (const f of step.fields) {
      if (f.type === 'select' && f.options?.length) data[f.id] = { q: f.label, v: f.options[0] };
      else if (f.type === 'multiselect' && f.options?.length) data[f.id] = { q: f.label, v: [f.options[0]] };
      else if (f.type === 'number') data[f.id] = { q: f.label, v: 5 };
      else if (f.type === 'boolean') data[f.id] = { q: f.label, v: true };
    }
  }
  return data;
}

test('every vertical has a journey model', () => {
  for (const c of CATEGORIES) {
    const defs = milestonesForCategory(c);
    expect(defs, `${c} has milestones`).toBeTruthy();
    expect(defs!.length).toBeGreaterThanOrEqual(6);
  }
});

test('seeding produces one valid milestone per def, no orphan keys', () => {
  for (const c of CATEGORIES) {
    const defs = milestonesForCategory(c);
    if (!defs) continue;
    const ms = seedJourneyFromAssessment(c, fixture(c), 1);
    expect(ms.length, `${c} milestone count`).toBe(defs.length);
    const defKeys = new Set(defs.map((d) => d.key));
    for (const m of ms) {
      expect(defKeys.has(m.key), `${c}: ${m.key} is a known def`).toBe(true);
      expect(['not_started', 'in_progress', 'done']).toContain(m.status);
    }
    // recomputeDerived stays consistent with the seeded list
    const { incompleteCount } = recomputeDerived(c, ms);
    expect(incompleteCount).toBe(ms.filter((m) => m.status !== 'done').length);
  }
});

test('unknown schema version falls back to all not_started', () => {
  const ms = seedJourneyFromAssessment('healthcare', fixture('healthcare'), 999);
  expect(ms.length).toBeGreaterThan(0);
  expect(ms.every((m) => m.status === 'not_started')).toBe(true);
});

test('teaching strong profile seeds the expected dones', () => {
  const strong: AssessmentData = {
    'documents.passport_status': { q: '', v: 'Valid, 2+ years remaining' },
    'documents.police_clearance': { q: '', v: 'Current (within 6 months)' },
    'readiness.english_test': { q: '', v: 'IELTS' },
    'registration.sace_status': { q: '', v: 'Active (full)' },
    'registration.qts_started': { q: '', v: 'Completed' },
  };
  const byKey = Object.fromEntries(
    seedJourneyFromAssessment('teaching', strong, 1).map((m) => [m.key, m.status]),
  );
  expect(byKey.passport).toBe('done');
  expect(byKey.sace_registration).toBe('done');
  expect(byKey.qts_route).toBe('done');
  expect(byKey.police_clearance).toBe('done');
  expect(byKey.english_test).toBe('done');
  expect(byKey.sponsor_secured).toBe('not_started');
});
