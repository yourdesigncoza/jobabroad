import type { CategoryId } from '@/lib/categories';

/**
 * Hand-maintained category-specific scam / fraud patterns surfaced inside the
 * paid PDF report so buyers see them without leaving the document. Source of
 * truth for now is this file — tracked in git, reviewed in PR. If/when
 * non-developers need to edit these, migrate to content/red-flags/*.json
 * (see GEMINI_REVIEW.md decision #10).
 *
 * Rules of thumb when curating:
 * - Each bullet is one specific pattern, not a vague warning.
 * - Phrase as the behaviour to AVOID, not the behaviour to do ("Don't pay
 *   placement fees" beats "Verify the recruiter").
 * - 4-6 bullets per category — more than that and readers skim past.
 * - Keep wording legally cautious (no naming specific bad actors here; the
 *   /scam-warnings page handles that surface separately).
 */
const RED_FLAGS: Partial<Record<CategoryId, string[]>> = {
  teaching: [
    'Upfront placement fees of any kind — legitimate UK/UAE/AUS schools pay the recruiter, not you',
    'Recruiters who don\'t help you register with SACE, NMC, AHPRA or the destination\'s equivalent regulator',
    'Contracts not provided in English, or with key clauses (salary, hours, notice period) left vague',
    'Employers who hold your passport "for safekeeping" once you arrive — this is illegal in most destinations',
    'Salary paid in cash with no payslip — you need a paper trail for visa renewals and tax compliance',
    'Pressure to sign or pay within 24-48 hours "before someone else takes the spot"',
  ],
  healthcare: [
    'Upfront "registration" or "placement" fees — legitimate NHS trusts and AU/NZ hospitals pay the agency, not you',
    'Agencies that won\'t guide you through NMC, AHPRA or NCNZ registration and the OSCE / CBT / OBA steps',
    '"Guaranteed" job offers made before you\'ve passed IELTS or OET and cleared registration',
    'Employers who hold your passport or original certificates "for safekeeping" once you arrive',
    'Contracts with vague salary bands, unpaid "training periods", or clawback clauses if you leave early',
    'Pressure to buy IELTS/OET prep or CBT bookings through the agency at inflated prices',
  ],
  engineering: [
    'Upfront fees to "secure" a role or sponsorship — reputable employers and Washington Accord pathways don\'t charge candidates',
    'Consultants promising ECSA-to-overseas recognition without going through Engineers Australia, the Engineering Council or Ecctis',
    'Offers that skip the formal skills / competency assessment your destination actually requires',
    'Contracts left vague on discipline, registration support, salary, or who pays relocation',
    'Requests to pay visa or sponsorship costs the employer is legally meant to cover (e.g. a UK Certificate of Sponsorship)',
  ],
  'it-tech': [
    'Upfront fees for "job placement" or "visa sponsorship" — real tech employers cover sponsorship costs',
    'Recruiters asking for payment to "fast-track" a skilled-worker visa or get you onto a shortage-occupation list',
    'Offers requiring you to pay for equipment, training, or certifications before you start',
    'Vague "remote contractor" roles that want your ID and banking details before any signed contract',
    'Salary paid in crypto or cash with no contract or payslip — you need a paper trail for visas and tax',
  ],
  trades: [
    'Upfront fees for a job, visa, or "skills assessment booking" — TRA/VETASSESS fees are paid directly to the assessor, never to an agent',
    'Agents promising to skip the trade test or skills assessment your destination requires',
    'Employers who hold your trade certificate or passport once you arrive',
    'Contracts vague on hourly rate, overtime, accommodation deductions, or whether your ticket is recognised',
    'Cash-in-hand work with no payslip — it blocks visa renewals and tax compliance',
  ],
  tefl: [
    'Schools or agents charging a "deposit" or recruitment fee — reputable schools pay the recruiter',
    'Offers to "start on a tourist visa" — working without the right permit (China Z visa, Vietnam work permit) risks detention and deportation',
    'Employers who hold your passport or original degree after you arrive',
    'Contracts vague on teaching hours, paid holidays, airfare reimbursement, or housing',
    '"Guaranteed" jobs that first require buying the recruiter\'s own (often worthless) TEFL certificate',
    'Salary well above market with no school named and no contract provided',
  ],
  hospitality: [
    'Upfront "placement" or "training" fees — legitimate hotels, cruise lines and Gulf employers pay the recruiter',
    'Agents charging upfront for medicals, uniforms or STCW courses at inflated prices',
    'Employers withholding passports, or accommodation/food deductions that aren\'t written into the contract',
    'Contracts vague on hours, overtime, tips, or length (cruise contracts run long — know the terms before you sign)',
    'Pressure to sign within 24-48 hours "before the position is filled"',
  ],
  farming: [
    'Upfront fees for a seasonal visa or job — UK Seasonal Worker visas are sponsored by licensed scheme operators who don\'t charge you a placement fee',
    'Agents who aren\'t on the official approved scheme-operator / sponsor list for your destination',
    'Offers with no named farm or employer, no contract, or pay quoted on piece-rate only',
    'Accommodation or transport costs deducted at rates that swallow most of your wages',
    'Employers holding passports, or asking you to repay "recruitment costs" out of your wages',
  ],
  seasonal: [
    'Upfront fees beyond the official programme or visa cost — designated sponsors and camps don\'t charge placement fees',
    'Sponsors not on the official designated-sponsor list (US J-1, UK scheme operators)',
    'Working on a tourist visa "to start sooner" — it\'s illegal and risks a future visa ban',
    'Contracts vague on hours, pay, accommodation deductions, or end dates',
    'Pressure to pay deposits into an individual\'s personal bank account',
  ],
  'au-pair': [
    'Agencies or "host families" asking you for placement fees — US J-1 sponsors charge the family, and reputable EU agencies don\'t charge au pairs large upfront fees',
    '"Families" who contact you off-platform and ask for travel money or a visa deposit — a classic advance-fee scam',
    'Arrangements that skip a designated sponsor (US) or a proper au-pair visa — au-pairing on a tourist visa is illegal',
    'Vague terms on weekly hours, pocket money, days off, or your own room (programme rules cap hours for a reason)',
    'Host families who hold your passport or your return ticket',
  ],
};

export function getRedFlagsForCategory(category: CategoryId): string[] {
  return RED_FLAGS[category] ?? [];
}
