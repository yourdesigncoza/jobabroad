// Pure milestone logic — no server-only, no DB. Kept separate from journey.ts
// so it can be unit-tested in plain Node.
import type { AssessmentData } from '@/lib/assessments/schemas/assessment';
import { SCHEMA_VERSION } from '@/lib/assessments/types';

export type MilestoneStatus = 'not_started' | 'in_progress' | 'done';
export type MilestoneSource = 'seed' | 'llm' | 'manual';

export const STATUS_RANK: Record<MilestoneStatus, number> = {
  not_started: 0,
  in_progress: 1,
  done: 2,
};

function isStatus(s: unknown): s is MilestoneStatus {
  return s === 'not_started' || s === 'in_progress' || s === 'done';
}

export interface Milestone {
  key: string;
  label: string;
  status: MilestoneStatus;
  source: MilestoneSource;
  updated_by: MilestoneSource;
  updated_at: string;
}

export interface MilestoneDef {
  key: string;
  label: string;
}

export interface MilestoneUpdate {
  key: string;
  status: MilestoneStatus;
}

function answerString(data: AssessmentData, key: string): string {
  const e = data[key];
  if (!e) return '';
  if (typeof e.v === 'string') return e.v;
  if (Array.isArray(e.v)) return e.v.join(',');
  return String(e.v);
}

function answerArray(data: AssessmentData, key: string): string[] {
  const e = data[key];
  return Array.isArray(e?.v) ? e.v.map(String) : [];
}

// `documents.passport_status` and `documents.police_clearance` use the same
// field id + value conventions across every vertical, so these two seeders are
// shared. (Passport options vary only in the validity window — "Valid, 2+…",
// "Valid — 2+…", "Valid — 18+…" — all start with "Valid".)
function seedPassport(data: AssessmentData): MilestoneStatus {
  const v = answerString(data, 'documents.passport_status');
  return v.startsWith('Valid') ? 'done' : v === 'Expired' ? 'in_progress' : 'not_started';
}
function seedPolice(data: AssessmentData): MilestoneStatus {
  const v = answerString(data, 'documents.police_clearance');
  if (v === 'Current (within 6 months)') return 'done';
  if (v.startsWith('Older') || v.startsWith('Applied')) return 'in_progress';
  return 'not_started';
}

/** Classifies a value against done/in-progress option lists; default not_started. */
function classify(value: string, done: string[], inProgress: string[]): MilestoneStatus {
  if (done.includes(value)) return 'done';
  if (inProgress.includes(value)) return 'in_progress';
  return 'not_started';
}

/** True if any of the destination credential-recognition fields is complete /
 *  in progress. Engineering, it-tech and trades each have a set of these
 *  (Engineers Australia, Ecctis, WES, ACS, TRA, …); we surface the furthest-along
 *  one as a single "overseas recognition" milestone. */
function seedOverseasRecognition(data: AssessmentData, fieldIds: string[]): MilestoneStatus {
  let best: MilestoneStatus = 'not_started';
  for (const id of fieldIds) {
    const v = answerString(data, id).toLowerCase();
    if (!v) continue;
    if (/received|completed|approved|suitable outcome/.test(v)) return 'done';
    if (/in progress|submitted|applied/.test(v)) best = 'in_progress';
  }
  return best;
}

interface CategoryJourney {
  defs: MilestoneDef[];
  seed: (data: AssessmentData) => Record<string, MilestoneStatus>;
}

// Per-vertical journeys. Each `seed` maps that vertical's submitted-assessment
// answers to initial milestone statuses; keys with no assessment signal (job
// offer, visa, relocation) are omitted and default to not_started.
const JOURNEYS: Record<string, CategoryJourney> = {
  teaching: {
    defs: [
      { key: 'passport', label: 'Valid passport' },
      { key: 'english_test', label: 'English language test' },
      { key: 'sace_registration', label: 'SACE registration' },
      { key: 'qts_route', label: 'Overseas teacher registration (QTS / iQTS)' },
      { key: 'police_clearance', label: 'Police clearance' },
      { key: 'sponsor_secured', label: 'School / sponsor secured' },
      { key: 'visa_application', label: 'Visa application' },
      { key: 'relocation_logistics', label: 'Relocation logistics' },
    ],
    seed: (d) => ({
      passport: seedPassport(d),
      police_clearance: seedPolice(d),
      english_test: ['IELTS', 'TOEFL', 'Other / exempt'].includes(answerString(d, 'readiness.english_test'))
        ? 'done'
        : 'not_started',
      sace_registration: classify(
        answerString(d, 'registration.sace_status'),
        ['Active (full)'],
        ['Provisional', 'Pending renewal'],
      ),
      qts_route: classify(answerString(d, 'registration.qts_started'), ['Completed'], ['In progress']),
    }),
  },

  healthcare: {
    defs: [
      { key: 'passport', label: 'Valid passport' },
      { key: 'english_test', label: 'English test (IELTS / OET)' },
      { key: 'sanc_registration', label: 'SANC registration' },
      { key: 'overseas_registration', label: 'Overseas registration (NMC / AHPRA / NCNZ)' },
      { key: 'police_clearance', label: 'Police clearance' },
      { key: 'job_offer', label: 'Job / employer secured' },
      { key: 'visa_application', label: 'Visa application' },
      { key: 'relocation_logistics', label: 'Relocation logistics' },
    ],
    seed: (d) => ({
      passport: seedPassport(d),
      police_clearance: seedPolice(d),
      english_test: ['IELTS', 'OET'].includes(answerString(d, 'readiness.english_test')) ? 'done' : 'not_started',
      sanc_registration: classify(answerString(d, 'registration.sanc_status'), ['Active'], ['Pending renewal']),
      overseas_registration: classify(
        answerString(d, 'registration.prior_nmc_ahpra_ncnz'),
        ['Completed'],
        ['In progress'],
      ),
    }),
  },

  engineering: {
    defs: [
      { key: 'passport', label: 'Valid passport' },
      { key: 'english_test', label: 'English test (IELTS / PTE)' },
      { key: 'ecsa_registration', label: 'ECSA registration' },
      { key: 'overseas_recognition', label: 'Overseas recognition (Engineers Australia / Ecctis / WES)' },
      { key: 'qualifications_apostilled', label: 'Qualifications apostilled' },
      { key: 'police_clearance', label: 'Police clearance' },
      { key: 'job_offer', label: 'Job / sponsor secured' },
      { key: 'visa_application', label: 'Visa application' },
    ],
    seed: (d) => ({
      passport: seedPassport(d),
      police_clearance: seedPolice(d),
      english_test: answerString(d, 'readiness.english_test') === 'None yet' ? 'not_started' : 'done',
      ecsa_registration: classify(
        answerString(d, 'registration.ecsa_status'),
        ['Pr Eng (Professional Engineer)', 'Pr Tech Eng (Professional Engineering Technologist)', 'Pr Techni Eng (Professional Engineering Technician)'],
        ['Candidate (Candidate Eng / Tech / Techni)'],
      ),
      overseas_recognition: seedOverseasRecognition(d, [
        'assessment.ea_status',
        'assessment.enz_status',
        'assessment.ecctis_status',
        'assessment.wes_status',
      ]),
      qualifications_apostilled: classify(answerString(d, 'documents.dirco_apostille'), ['Done'], ['In progress']),
    }),
  },

  'it-tech': {
    defs: [
      { key: 'passport', label: 'Valid passport' },
      { key: 'english_test', label: 'English test (IELTS / PTE)' },
      { key: 'skills_assessment', label: 'Skills assessment (ACS / WES / Ecctis)' },
      { key: 'cv_portfolio', label: 'CV + portfolio in destination format' },
      { key: 'police_clearance', label: 'Police clearance' },
      { key: 'job_offer', label: 'Job offer / sponsor secured' },
      { key: 'visa_application', label: 'Visa application' },
      { key: 'relocation_logistics', label: 'Relocation logistics' },
    ],
    seed: (d) => ({
      passport: seedPassport(d),
      police_clearance: seedPolice(d),
      english_test: answerString(d, 'readiness.english_test') === 'None yet' ? 'not_started' : 'done',
      skills_assessment: seedOverseasRecognition(d, [
        'assessment.acs_status',
        'assessment.wes_status',
        'assessment.ecctis_status',
      ]),
      cv_portfolio: classify(
        answerString(d, 'documents.cv_in_destination_format'),
        ['Yes — ATS-friendly, destination format'],
        ['Yes — but SA format', 'Working on it'],
      ),
      job_offer: classify(
        answerString(d, 'readiness.remote_offer'),
        ['Remote-first offer from destination employer'],
        ['Active interviews with destination employers'],
      ),
    }),
  },

  trades: {
    defs: [
      { key: 'passport', label: 'Valid passport' },
      { key: 'trade_test', label: 'Trade test / Red Seal' },
      { key: 'skills_assessment', label: 'Offshore skills assessment (TRA / TEA / IQA)' },
      { key: 'english_test', label: 'English test (IELTS / PTE)' },
      { key: 'police_clearance', label: 'Police clearance' },
      { key: 'job_offer', label: 'Job / sponsor secured' },
      { key: 'visa_application', label: 'Visa application' },
      { key: 'relocation_logistics', label: 'Relocation logistics' },
    ],
    seed: (d) => ({
      passport: seedPassport(d),
      police_clearance: seedPolice(d),
      english_test: answerString(d, 'readiness.english_test') === 'None yet' ? 'not_started' : 'done',
      trade_test: classify(
        answerString(d, 'trade.red_seal_status'),
        ['Passed — certificate in hand'],
        ['Passed — certificate lost', 'Booked / writing soon'],
      ),
      skills_assessment: seedOverseasRecognition(d, [
        'assessment.tra_osap_status',
        'assessment.canadian_tea_status',
        'assessment.nz_iqa_status',
      ]),
    }),
  },

  tefl: {
    defs: [
      { key: 'passport', label: 'Valid passport' },
      { key: 'tefl_certificate', label: 'TEFL / TESOL certificate' },
      { key: 'degree', label: "Bachelor's degree" },
      { key: 'degree_legalised', label: 'Degree legalised / apostilled' },
      { key: 'police_clearance', label: 'Police clearance' },
      { key: 'job_offer', label: 'School / employer secured' },
      { key: 'visa_application', label: 'Visa application' },
      { key: 'relocation_logistics', label: 'Relocation logistics' },
    ],
    seed: (d) => ({
      passport: seedPassport(d),
      police_clearance: seedPolice(d),
      tefl_certificate: classify(
        answerString(d, 'credential.tefl_cert_type'),
        ['CELTA (Cambridge)', 'Trinity CertTESOL', 'Ofqual-regulated Level 5 Diploma', 'Online TEFL (120hr+)'],
        ['Online TEFL (under 120hr)', 'None yet — planning to get one'],
      ),
      degree: classify(
        answerString(d, 'qualifications.degree_status'),
        ['Bachelor (any field)', 'Honours / Postgrad Diploma', 'Master / PhD'],
        ['Diploma (3-year)', 'Currently studying'],
      ),
      degree_legalised: classify(answerString(d, 'documents.degree_legalisation'), ['Done'], ['In progress']),
    }),
  },

  hospitality: {
    defs: [
      { key: 'passport', label: 'Valid passport' },
      { key: 'qualification', label: 'Culinary / hospitality qualification' },
      { key: 'english_test', label: 'English test (IELTS / OET / PTE)' },
      { key: 'police_clearance', label: 'Police clearance' },
      { key: 'job_offer', label: 'Employer / cruise line secured' },
      { key: 'visa_application', label: 'Visa application' },
      { key: 'relocation_logistics', label: 'Relocation logistics' },
    ],
    seed: (d) => ({
      passport: seedPassport(d),
      police_clearance: seedPolice(d),
      qualification: classify(
        answerString(d, 'qualifications.formal_qualification'),
        [
          'Occupational Certificate: Chef (QCTO, NQF 5)',
          'National Certificate: Professional Cookery (CATHSSETA, NQF 2–4)',
          'Diploma in Culinary Arts / Hotel Management',
          'Degree in Hospitality / Culinary Arts',
        ],
        ['In-house training only — no formal qualification'],
      ),
      english_test: classify(
        answerString(d, 'qualifications.english_test'),
        ['Have valid IELTS/OET/PTE (within 2 years)', 'Not applicable to my target'],
        ['Booked / studying for one'],
      ),
    }),
  },

  farming: {
    defs: [
      { key: 'passport', label: 'Valid passport' },
      { key: 'farm_experience', label: 'Relevant farm experience' },
      { key: 'drivers_licence', label: "Driver's / machinery licence" },
      { key: 'police_clearance', label: 'Police clearance' },
      { key: 'scheme_placement', label: 'Seasonal scheme / employer secured' },
      { key: 'visa_application', label: 'Visa application' },
      { key: 'relocation_logistics', label: 'Relocation logistics' },
    ],
    seed: (d) => {
      const types = answerArray(d, 'experience.experience_types').filter((t) => t && t !== 'None yet');
      return {
        passport: seedPassport(d),
        police_clearance: seedPolice(d),
        farm_experience: types.length ? 'done' : 'not_started',
        drivers_licence: classify(
          answerString(d, 'skills.drivers_licence'),
          ['Full SA Code 8/EB', 'Code 10/14 (LDV/HDV)', 'Heavy machinery / Code EC'],
          ['Tractor experience only (no licence)'],
        ),
      };
    },
  },

  seasonal: {
    defs: [
      { key: 'passport', label: 'Valid passport' },
      { key: 'sponsor_secured', label: 'Designated sponsor secured' },
      { key: 'police_clearance', label: 'Police clearance' },
      { key: 'job_placement', label: 'Job placement confirmed' },
      { key: 'visa_application', label: 'Visa (DS-2019 / work permit)' },
      { key: 'relocation_logistics', label: 'Flights + insurance booked' },
    ],
    seed: (d) => ({
      passport: seedPassport(d),
      police_clearance: seedPolice(d),
      sponsor_secured: classify(
        answerString(d, 'programme.previously_applied'),
        ['Yes — completed'],
        ['Yes — in progress'],
      ),
    }),
  },

  'au-pair': {
    defs: [
      { key: 'passport', label: 'Valid passport' },
      { key: 'childcare_hours', label: 'Documented childcare hours (200+)' },
      { key: 'references', label: 'Contactable references' },
      { key: 'first_aid', label: 'First-aid certificate' },
      { key: 'drivers_licence', label: "Driver's licence" },
      { key: 'police_clearance', label: 'Police clearance' },
      { key: 'sponsor_match', label: 'Sponsor / host family matched' },
      { key: 'visa_application', label: 'Visa application (DS-2019 / au-pair visa)' },
    ],
    seed: (d) => ({
      passport: seedPassport(d),
      police_clearance: seedPolice(d),
      childcare_hours: classify(
        answerString(d, 'experience.childcare_hours'),
        ['200–500 hours', '500+ hours'],
        ['50–200 hours'],
      ),
      references: classify(
        answerString(d, 'experience.references'),
        ['3+ contactable references'],
        ['1–2 references'],
      ),
      first_aid: classify(answerString(d, 'experience.first_aid'), ['Current (within 2 years)'], ['Expired']),
      drivers_licence: classify(
        answerString(d, 'practical.drivers_licence'),
        ['Code B (full)'],
        ['Learners only', 'In progress'],
      ),
    }),
  },

  accounting: {
    defs: [
      { key: 'passport', label: 'Valid passport' },
      { key: 'english_test', label: 'English test (if your visa needs one)' },
      { key: 'saica_membership', label: 'Professional body membership (SAICA / SAIPA)' },
      { key: 'overseas_recognition', label: 'Overseas recognition (ICAEW / CA ANZ / CPA)' },
      { key: 'police_clearance', label: 'Police clearance' },
      { key: 'job_offer', label: 'Job / sponsor secured' },
      { key: 'visa_application', label: 'Visa application' },
      { key: 'relocation_logistics', label: 'Relocation logistics' },
    ],
    seed: (d) => ({
      passport: seedPassport(d),
      police_clearance: seedPolice(d),
      english_test: classify(
        answerString(d, 'readiness.english_test'),
        ['IELTS / PTE done', 'Not needed for my route', 'Exempt'],
        [],
      ),
      saica_membership: classify(
        answerString(d, 'registration.membership_status'),
        ['Active member in good standing'],
        ['Member, fees in arrears'],
      ),
      overseas_recognition: classify(
        answerString(d, 'registration.overseas_body_started'),
        ['Completed / admitted'],
        ['Researching / Letter of Good Standing requested', 'Application submitted'],
      ),
    }),
  },
};

/** Back-compat: teaching milestone defs were previously exported by name. */
export const TEACHING_MILESTONES: MilestoneDef[] = JOURNEYS.teaching.defs;

export function milestonesForCategory(category: string): MilestoneDef[] | null {
  return JOURNEYS[category]?.defs ?? null;
}

/**
 * Builds the initial milestone list for a user from their submitted assessment.
 * Each category has a seed mapping; an unknown category, missing data, or an
 * unknown schema_version falls back to all-`not_started` rather than mis-seeding.
 */
export function seedJourneyFromAssessment(
  category: string,
  data: AssessmentData | null,
  schemaVersion: number,
): Milestone[] {
  const journey = JOURNEYS[category];
  if (!journey) return [];

  const statusMap = data && schemaVersion === SCHEMA_VERSION ? journey.seed(data) : {};

  const now = new Date().toISOString();
  return journey.defs.map((d) => ({
    key: d.key,
    label: d.label,
    status: statusMap[d.key] ?? 'not_started',
    source: 'seed',
    updated_by: 'seed',
    updated_at: now,
  }));
}

/**
 * Validates and applies milestone status changes.
 * - rejects unknown keys (no hallucinated milestones) and bad statuses
 * - LLM updates are monotonic-forward only and may advance at most to
 *   `in_progress` — `done` is reserved for an explicit user statement (handled
 *   upstream) or a manual toggle, so the model can't mark a doc done just
 *   because the user asked about it
 * - manual updates may set any valid status, including regressions
 */
export function applyMilestoneUpdates(
  category: string,
  milestones: Milestone[],
  updates: MilestoneUpdate[],
  source: 'llm' | 'manual',
): Milestone[] {
  const defs = milestonesForCategory(category);
  if (!defs) return milestones;
  const validKeys = new Set(defs.map((d) => d.key));
  const now = new Date().toISOString();
  const next = milestones.map((m) => ({ ...m }));

  for (const u of updates) {
    if (!u || !validKeys.has(u.key) || !isStatus(u.status)) continue;
    const idx = next.findIndex((m) => m.key === u.key);
    if (idx === -1) continue;
    const current = next[idx];

    let status = u.status;
    if (source === 'llm') {
      if (status === 'done') status = 'in_progress';
      // monotonic forward only
      if (STATUS_RANK[status] <= STATUS_RANK[current.status]) continue;
    }

    next[idx] = { ...current, status, updated_by: source, updated_at: now };
  }

  return next;
}

export function recomputeDerived(
  category: string,
  milestones: Milestone[],
): { incompleteCount: number; nextMilestoneKey: string | null } {
  const defs = milestonesForCategory(category) ?? [];
  let incompleteCount = 0;
  let nextMilestoneKey: string | null = null;
  for (const d of defs) {
    const m = milestones.find((x) => x.key === d.key);
    if (!m || m.status !== 'done') {
      incompleteCount++;
      if (!nextMilestoneKey) nextMilestoneKey = d.key;
    }
  }
  return { incompleteCount, nextMilestoneKey };
}

export function milestoneLabel(category: string, key: string | null): string | null {
  if (!key) return null;
  return milestonesForCategory(category)?.find((d) => d.key === key)?.label ?? null;
}
