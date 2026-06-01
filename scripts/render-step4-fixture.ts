// One-shot fixture render: exercises the post-Phase-2 PDF template (no call
// notes; 5-7 next actions; red-flags block; trusted-partners cards + every-
// page footer strip) without going through OpenAI or Supabase. Partners flow
// through the live getTrustedPartnersForBuyer matcher so the fixture also
// serves as an integration smoke test of the trusted-partner matching
// pipeline. Writes a PDF to docs/prompt-tests/.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { ReportTemplate } from '@/lib/reports/pdf-template';
import type { ReportData } from '@/lib/reports/types';
import { getTrustedPartnersForBuyer } from '@/lib/recruiters';
import { getRedFlagsForCategory } from '@/lib/reports/red-flags';

// Sarah's fixture buyer is a SA teacher targeting UK + UAE. Apostil serves
// both, so the matcher should surface it in the partners block.
const matched = getTrustedPartnersForBuyer({
  category: 'teaching',
  targetDestinations: ['UK', 'UAE'],
});
const livePartners: ReportData['partners'] = matched.length
  ? matched.slice(0, 4).map((r) => {
      const destBit = r.destinations.length ? ` · ${r.destinations.slice(0, 3).join(', ')}` : '';
      return {
        name: r.name,
        subline: `${r.type || 'Recruiter'}${destBit}`,
        notes: r.notes,
        bullets: r.trustedBullets,
        url: r.website || undefined,
      };
    })
  : undefined;

const data: ReportData = {
  userName: 'Sarah van der Merwe',
  categoryLabel: 'Teaching',
  generatedAt: '2026-05-17',
  focus: {
    destinations: ['UAE', 'UK'],
    specialisms: ['Maths', 'Sciences'],
  },
  score: {
    overall: 76,
    band: 'strong_potential',
    dimensions: [
      { key: 'credentials', label: 'Credentials & Registration', weight: 0.25, score: 80, contributing: [] },
      { key: 'specialism', label: 'Subject Demand', weight: 0.2, score: 100, contributing: [] },
      { key: 'experience', label: 'Teaching Experience', weight: 0.15, score: 70, contributing: [] },
      { key: 'documents', label: 'Documents & Finances', weight: 0.2, score: 50, contributing: [] },
      { key: 'language', label: 'Language', weight: 0.1, score: 90, contributing: [] },
      { key: 'readiness', label: 'Family & Timing', weight: 0.1, score: 75, contributing: [] },
    ],
  },
  whatsWorking:
    'Your SACE registration and 5 years of secondary teaching put you ahead of most applicants. UK QTS recognition is straightforward via the iQTS route from your existing qualifications.',
  whatsBlocking:
    'Your police clearance has lapsed and your degree transcripts have not been apostilled. Both are required before any UK school can issue a Certificate of Sponsorship, and the apostille queue at DIRCO is currently 4 to 6 weeks.',
  nextActions: [
    {
      title: 'Renew SAPS police clearance now',
      body: 'Apply online via SAPS eServices (saps.gov.za/eservices). 8 to 10 week turnaround so start this week, not after the rest is sorted. Fee is R150. Once you upload it to your UK Skilled Worker visa application, the Home Office accepts it for 6 months from issue date.',
    },
    {
      title: 'Apostille your degree + SACE certificate',
      body: 'Use a DIRCO-registered concierge such as Apostil.co.za (Wednesday batch submissions cut the wait to roughly 2 weeks vs the 4-6 week DIRCO queue). Budget R650 per document; you need both your degree transcript and your SACE registration certificate.',
    },
    {
      title: 'Apply for iQTS via the TRA',
      body: 'Submit your application to the UK Teaching Regulation Agency (gov.uk/guidance/qualified-teacher-status-qts) using your B.Ed + 2+ years post-qualifying teaching. Fee £169, decision in 4 months. iQTS converts to full QTS once you have 2 years UK teaching.',
    },
    {
      title: 'Format your CV to UK standards',
      body: 'Strip the photo, ID number, marital status, and references. Lead with a 3-line personal statement, then most-recent-first roles with measurable outcomes (e.g. "Lifted Gr 11 Maths pass rate from 64% to 81% over 3 years"). Keep it to 2 pages.',
    },
    {
      title: 'Get on TES Jobs and Eteach',
      body: 'Both are free for candidates and cover roughly 80% of advertised UK teaching vacancies. Set alerts for "Secondary Maths" in your target counties. Apply to 3-5 schools per week — UK schools recruit on rolling intake, not just September.',
    },
  ],
  contacts: [
    {
      heading: 'Document checklist',
      excerpt:
        'Complete list of what you need: SAPS clearance, apostilled degree, SACE certificate, TEFL if applying to international schools, CV in UK format.',
      url: 'https://jobabroad.co.za/members/teaching#2-document-checklist',
    },
    {
      heading: 'Visa route overview',
      excerpt:
        'Skilled Worker visa via Certificate of Sponsorship from a UK school. Salary threshold £30,960 from April 2026.',
      url: 'https://jobabroad.co.za/members/teaching#4-visa-route-overview',
    },
  ],
  redFlags: getRedFlagsForCategory('teaching'),
  partners: livePartners,
};

async function main() {
  const element = React.createElement(ReportTemplate, { data }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);
  const outDir = join(process.cwd(), 'docs/prompt-tests');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'step4-template-fixture.pdf');
  writeFileSync(outPath, buffer);
  console.log('wrote', outPath, `(${buffer.length} bytes)`);
  console.log('matched partners:', (livePartners ?? []).map((p) => p.name));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
