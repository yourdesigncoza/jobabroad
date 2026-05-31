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
import { IT_TECH_STEPS } from './it-tech';

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
  'it-tech': IT_TECH_STEPS,
};

/**
 * Final free-text step appended to every category's flow. It catches anything
 * the structured questions don't ask — disabilities, health conditions, family
 * or financial ties, strong destination preferences — so the personalised
 * report can account for context we never explicitly prompted for. Defined once
 * here rather than copied into all 11 step files. Optional, so it never blocks
 * submission.
 */
export const ABOUT_YOU_STEP: StepDef = {
  slug: 'about',
  title: 'About you',
  fields: [
    {
      id: 'about.summary',
      version: 1,
      label: 'Tell us about yourself',
      type: 'textarea',
      optional: true,
      maxLength: 1500,
      hint: "Anything that could shape your move that we haven't asked about. For example: a disability or health condition we should plan around; family or financial circumstances that tie you to a region; or a strong preference about where you want to go and why.",
      placeholder:
        'For example: I have a hearing impairment and would need a school set up to support it. I also care for my mother, so I can only consider destinations with a fast family-visa route.',
    },
  ],
};

export function getStepsForCategory(category: string): StepDef[] | null {
  const steps = REGISTRY[category];
  // Spread so we never mutate the registry array, and append the shared
  // free-text step as the last thing every applicant sees.
  return steps ? [...steps, ABOUT_YOU_STEP] : null;
}

export function hasAssessment(category: string): boolean {
  return category in REGISTRY;
}
