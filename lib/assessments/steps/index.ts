import type { StepDef } from '../types';
import { HEALTHCARE_STEPS } from './healthcare';
import { TEACHING_STEPS } from './teaching';
import { SEASONAL_STEPS } from './seasonal';
import { FARMING_STEPS } from './farming';
import { HOSPITALITY_STEPS } from './hospitality';
import { TEFL_STEPS } from './tefl';
import { AU_PAIR_STEPS } from './au-pair';
import { ENGINEERING_STEPS } from './engineering';
import { TRADES_STEPS } from './trades';

const REGISTRY: Record<string, StepDef[]> = {
  healthcare: HEALTHCARE_STEPS,
  teaching: TEACHING_STEPS,
  seasonal: SEASONAL_STEPS,
  farming: FARMING_STEPS,
  hospitality: HOSPITALITY_STEPS,
  tefl: TEFL_STEPS,
  'au-pair': AU_PAIR_STEPS,
  engineering: ENGINEERING_STEPS,
  trades: TRADES_STEPS,
};

export function getStepsForCategory(category: string): StepDef[] | null {
  return REGISTRY[category] ?? null;
}

export function hasAssessment(category: string): boolean {
  return category in REGISTRY;
}
