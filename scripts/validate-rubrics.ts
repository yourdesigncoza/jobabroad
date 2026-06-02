// Cross-checks every scoring rubric against its assessment definition so a
// typo'd option key (which would silently score 0) is caught at build time, not
// in production. For each rubric: every rule.field_id must exist in the
// assessment; every match/best_match KEY must be a real option of that field
// (or "true"/"false" for booleans); range/count fields must be numeric; and the
// dimension weights must sum to 1. Run: npx tsx scripts/validate-rubrics.ts
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getStepsForCategory } from '@/lib/assessments/steps';
import type { Rubric, Rule } from '@/lib/scoring/types';
import type { FieldDef } from '@/lib/assessments/types';

const RUBRICS_DIR = join(process.cwd(), 'lib/scoring/rubrics');

interface FieldInfo {
  type: FieldDef['type'];
  options: Set<string>;
}

function fieldIndex(category: string): Map<string, FieldInfo> | null {
  const steps = getStepsForCategory(category);
  if (!steps) return null;
  const idx = new Map<string, FieldInfo>();
  for (const step of steps) {
    for (const f of step.fields) {
      idx.set(f.id, {
        type: f.type,
        options: new Set('options' in f && Array.isArray(f.options) ? f.options : []),
      });
    }
  }
  return idx;
}

const VALID_BANDS = new Set(['high_blockers', 'needs_prep', 'strong_potential']);

function checkCaps(rubric: Rubric, fields: Map<string, FieldInfo>, errors: string[], category: string) {
  for (const cap of rubric.caps ?? []) {
    const where = `${category}/caps`;
    const f = fields.get(cap.field_id);
    if (!f) {
      errors.push(`${where}: field_id "${cap.field_id}" does not exist in the assessment`);
      continue;
    }
    if (!VALID_BANDS.has(cap.max_band)) {
      errors.push(`${where}: "${cap.field_id}" max_band ${JSON.stringify(cap.max_band)} is not a valid band`);
    }
    for (const v of cap.when_value) {
      const ok = f.type === 'boolean' ? v === 'true' || v === 'false' : f.options.has(v);
      if (!ok) {
        errors.push(
          `${where}: "${cap.field_id}" when_value ${JSON.stringify(v)} is not a valid option` +
            (f.type === 'boolean' ? ' (boolean expects "true"/"false")' : ` (field type ${f.type})`),
        );
      }
    }
  }
}

function checkRule(rule: Rule, fields: Map<string, FieldInfo>, errors: string[], where: string) {
  const f = fields.get(rule.field_id);
  if (!f) {
    errors.push(`${where}: field_id "${rule.field_id}" does not exist in the assessment`);
    return;
  }
  const keysToCheck =
    rule.type === 'match' || rule.type === 'best_match' ? Object.keys(rule.match) : [];
  for (const key of keysToCheck) {
    const ok =
      f.type === 'boolean'
        ? key === 'true' || key === 'false'
        : f.options.has(key);
    if (!ok) {
      errors.push(
        `${where}: "${rule.field_id}" key ${JSON.stringify(key)} is not a valid option` +
          (f.type === 'boolean' ? ' (boolean expects "true"/"false")' : ` (field type ${f.type})`),
      );
    }
  }
  if ((rule.type === 'range' || rule.type === 'count') && f.type !== 'number') {
    errors.push(`${where}: "${rule.field_id}" uses a ${rule.type} rule but field type is ${f.type}`);
  }
}

let totalErrors = 0;
const files = readdirSync(RUBRICS_DIR).filter((f) => f.endsWith('.json'));
for (const file of files.sort()) {
  const category = file.replace(/\.json$/, '');
  const rubric = JSON.parse(readFileSync(join(RUBRICS_DIR, file), 'utf8')) as Rubric;
  const fields = fieldIndex(category);
  const errors: string[] = [];

  if (!fields) {
    errors.push(`no assessment registered for category "${category}"`);
  } else {
    const sum = rubric.dimensions.reduce((t, d) => t + d.weight, 0);
    if (Math.abs(sum - 1) > 1e-6) errors.push(`weights sum to ${sum}, expected 1.0`);
    for (const dim of rubric.dimensions) {
      for (const rule of dim.rules) checkRule(rule, fields, errors, `${category}/${dim.key}`);
    }
    checkCaps(rubric, fields, errors, category);
  }

  totalErrors += errors.length;
  const status = errors.length ? `✗ ${errors.length} issue(s)` : '✓ ok';
  console.log(`${category.padEnd(14)} ${status}`);
  for (const e of errors) console.log(`   - ${e}`);
}

console.log(`\n${files.length} rubric(s) checked, ${totalErrors} issue(s).`);
process.exit(totalErrors ? 1 : 0);
