import type { FieldDef, StepDef } from './types';

/**
 * A field with a `showIf` clause is only relevant when its dependency matches.
 * Used both for rendering (hide the field) and validation (don't require a
 * hidden field).
 */
export function isFieldVisible(
  field: FieldDef,
  values: Record<string, unknown>,
): boolean {
  if (!field.showIf) return true;
  const depValue = values[field.showIf.field];
  if ('includes' in field.showIf) {
    return Array.isArray(depValue) && depValue.includes(field.showIf.includes);
  }
  return depValue === field.showIf.value;
}

/** True when the field holds a usable answer for its type. */
export function isFieldAnswered(field: FieldDef, value: unknown): boolean {
  if (field.type === 'multiselect') {
    return Array.isArray(value) && value.length > 0;
  }
  if (field.type === 'boolean') {
    return value === true || value === false;
  }
  if (field.type === 'number') {
    return typeof value === 'number' && !Number.isNaN(value);
  }
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * IDs of fields on the step that are required, currently visible, and
 * unanswered — i.e. exactly what must be filled before advancing.
 */
export function getMissingRequiredFields(
  step: StepDef,
  values: Record<string, unknown>,
): string[] {
  return step.fields
    .filter(
      (f) =>
        !f.optional &&
        isFieldVisible(f, values) &&
        !isFieldAnswered(f, values[f.id]),
    )
    .map((f) => f.id);
}
