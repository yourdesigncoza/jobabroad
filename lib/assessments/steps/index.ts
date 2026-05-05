import type { StepDef } from '../types';
import { HEALTHCARE_STEPS } from './healthcare';
import { TEACHING_STEPS } from './teaching';
import { SEASONAL_STEPS } from './seasonal';

const REGISTRY: Record<string, StepDef[]> = {
  healthcare: HEALTHCARE_STEPS,
  teaching: TEACHING_STEPS,
  seasonal: SEASONAL_STEPS,
};

export function getStepsForCategory(category: string): StepDef[] | null {
  return REGISTRY[category] ?? null;
}

export function hasAssessment(category: string): boolean {
  return category in REGISTRY;
}
