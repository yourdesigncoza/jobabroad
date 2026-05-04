export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'boolean';

export interface FieldDef {
  id: string;
  version: number;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  hint?: string;
  optional?: boolean;
  showIf?: { field: string; value: string | boolean };
}

export interface StepDef {
  slug: string;
  title: string;
  supportHint?: string;
  fields: FieldDef[];
}

export const HEALTHCARE_STEPS: StepDef[] = [
  {
    slug: 'personal',
    title: 'Personal Details',
    fields: [
      { id: 'personal.full_name', version: 1, label: 'Full name', type: 'text' },
      { id: 'personal.age', version: 1, label: 'Age', type: 'number', placeholder: '32' },
      { id: 'personal.city_province', version: 1, label: 'City / Province', type: 'text', placeholder: 'Cape Town, Western Cape' },
      {
        id: 'personal.whatsapp_number',
        version: 1,
        label: 'WhatsApp number',
        type: 'text',
        hint: "We'll send your feedback to this number",
        placeholder: '079 123 4567',
      },
    ],
  },
  {
    slug: 'qualifications',
    title: 'Qualifications',
    fields: [
      {
        id: 'qualifications.highest_qualification',
        version: 1,
        label: 'Highest nursing qualification',
        type: 'select',
        options: ['Diploma', 'Degree', 'Honours', 'Masters', 'Other'],
      },
      { id: 'qualifications.institution', version: 1, label: 'Institution', type: 'text' },
      { id: 'qualifications.graduation_year', version: 1, label: 'Graduation year', type: 'number', placeholder: '2018' },
      {
        id: 'qualifications.speciality',
        version: 1,
        label: 'Speciality (select all that apply)',
        type: 'multiselect',
        options: ['ICU', 'Theatre', 'General', 'Paediatrics', 'Maternity', 'Psychiatry', 'Emergency', 'Other'],
      },
    ],
  },
  {
    slug: 'registration',
    title: 'SANC Registration',
    supportHint: "Not sure about your SANC details?",
    fields: [
      { id: 'registration.sanc_number', version: 1, label: 'SANC registration number', type: 'text' },
      {
        id: 'registration.sanc_status',
        version: 1,
        label: 'Registration status',
        type: 'select',
        options: ['Active', 'Lapsed', 'Pending renewal'],
      },
      {
        id: 'registration.sanc_expiry',
        version: 1,
        label: 'Registration expiry date',
        type: 'select',
        options: ['2025', '2026', '2027', '2028+', "I don't know"],
        hint: 'Approximate year is fine',
      },
      {
        id: 'registration.prior_nmc_ahpra_ncnz',
        version: 1,
        label: 'Have you started registration with NMC (UK), AHPRA (AU), or NCNZ (NZ)?',
        type: 'select',
        options: ['None started', 'In progress', 'Completed'],
      },
    ],
  },
  {
    slug: 'experience',
    title: 'Work Experience',
    fields: [
      { id: 'experience.years_experience', version: 1, label: 'Years of nursing experience', type: 'number', placeholder: '5' },
      {
        id: 'experience.employer_type',
        version: 1,
        label: 'Current / most recent employer type',
        type: 'select',
        options: ['Public hospital', 'Private hospital', 'Clinic', 'Agency', 'Other'],
      },
      {
        id: 'experience.worked_abroad',
        version: 1,
        label: 'Have you worked abroad before?',
        type: 'boolean',
      },
      {
        id: 'experience.worked_abroad_where',
        version: 1,
        label: 'Where did you work?',
        type: 'text',
        optional: true,
        showIf: { field: 'experience.worked_abroad', value: true },
      },
      {
        id: 'experience.notice_period',
        version: 1,
        label: 'Notice period at current job',
        type: 'select',
        options: ['Immediate', '1 month', '2 months', '3 months', 'Other / not employed'],
      },
    ],
  },
  {
    slug: 'documents',
    title: 'Documents & Finances',
    fields: [
      {
        id: 'documents.passport_status',
        version: 1,
        label: 'Passport status',
        type: 'select',
        options: ['Valid — 2+ years remaining', 'Valid — under 2 years remaining', 'Expired', 'No passport'],
      },
      {
        id: 'documents.police_clearance',
        version: 1,
        label: 'Police clearance certificate',
        type: 'select',
        options: ['Current (within 6 months)', 'Older than 6 months', 'None'],
      },
      {
        id: 'documents.dependants_count',
        version: 1,
        label: 'Number of dependants (spouse + children)',
        type: 'number',
        placeholder: '0',
        hint: 'Enter 0 if none',
      },
      {
        id: 'documents.available_capital',
        version: 1,
        label: 'Savings / available capital for relocation',
        type: 'select',
        options: ['Under R30k', 'R30k – R70k', 'R70k – R150k', 'R150k+', 'Prefer not to say'],
        hint: 'This helps us identify realistic destinations for you',
      },
    ],
  },
  {
    slug: 'readiness',
    title: 'Language & Readiness',
    supportHint: "Not sure which English test applies?",
    fields: [
      {
        id: 'readiness.english_rating',
        version: 1,
        label: 'How would you rate your English?',
        type: 'select',
        options: ['Basic', 'Conversational', 'Fluent', 'Native / first language'],
      },
      {
        id: 'readiness.english_test',
        version: 1,
        label: 'Have you taken an English test?',
        type: 'select',
        options: ['Not yet', 'IELTS', 'OET'],
      },
      {
        id: 'readiness.english_test_score',
        version: 1,
        label: 'Score / grade',
        type: 'text',
        optional: true,
        placeholder: 'e.g. IELTS 7.0 or OET B',
        showIf: { field: 'readiness.english_test', value: 'IELTS' },
      },
      {
        id: 'readiness.oet_grade',
        version: 1,
        label: 'OET grade',
        type: 'text',
        optional: true,
        placeholder: 'e.g. B in all components',
        showIf: { field: 'readiness.english_test', value: 'OET' },
      },
      {
        id: 'readiness.target_destinations',
        version: 1,
        label: 'Target destinations (select all)',
        type: 'multiselect',
        options: ['UK', 'Australia', 'New Zealand', 'UAE', 'Canada'],
      },
      {
        id: 'readiness.target_timeline',
        version: 1,
        label: 'Target timeline',
        type: 'select',
        options: ['As soon as possible', 'Within 6 months', 'Within 1 year', 'Just exploring'],
      },
    ],
  },
];

export const SCHEMA_VERSION = 1;
