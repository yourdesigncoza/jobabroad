// One-shot fixture render: exercises the new step-4 template branches
// (callNotes section + premium partners block) without going through OpenAI
// or Supabase. Writes a PDF to docs/prompt-tests/ for visual review.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { ReportTemplate } from '@/lib/reports/pdf-template';
import type { ReportData } from '@/lib/reports/types';

const data: ReportData = {
  userName: 'Sarah van der Merwe',
  categoryLabel: 'Teaching',
  generatedAt: '2026-05-17',
  score: {
    overall: 72,
    band: 'needs_prep',
    dimensions: [
      { key: 'credentials', label: 'Credentials', weight: 0.3, score: 80, contributing: [] },
      { key: 'experience', label: 'Experience', weight: 0.2, score: 70, contributing: [] },
      { key: 'language', label: 'Language', weight: 0.15, score: 90, contributing: [] },
      { key: 'documents', label: 'Documents', weight: 0.2, score: 50, contributing: [] },
      { key: 'readiness', label: 'Readiness', weight: 0.15, score: 75, contributing: [] },
    ],
  },
  whatsWorking:
    'Your SACE registration and 5 years of secondary teaching put you ahead of most applicants. UK QTS recognition is straightforward via the iQTS route from your existing qualifications.',
  whatsBlocking:
    'Your police clearance has lapsed and your degree transcripts have not been apostilled. Both are required before any UK school can issue a Certificate of Sponsorship, and the apostille queue at DIRCO is currently 4 to 6 weeks.',
  nextActions: [
    {
      title: 'Renew SAPS police clearance now',
      body: 'Apply online via SAPS eServices. 8 to 10 week turnaround so start this week, not after the rest is sorted.',
    },
    {
      title: 'Apostille your degree + SACE certificate',
      body: 'Use a DIRCO-registered concierge (Wednesday batch submissions cut the wait to ~2 weeks). Budget R650 per document.',
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
  callNotes: `On the call you mentioned you'd like to target the UK by September 2026, with secondary maths roles in mind. You also flagged that your husband would join you and the kids would need school places.

Action items we agreed on:
- You'll start the SAPS clearance this week (use the Cape Town Civic Centre office, faster than online)
- You'll get a quote from Apostil.co.za for the apostille batch
- We'll send you a UK-format CV template separately
- You'll book a follow-up call in 4 weeks to review applications

One concern raised: your maths PGCE is from 2008 — some UK academies prefer "recent" PGCE (last 10 years). We discussed framing your CPD and your IB workshop attendance to bridge that perception.`,
  partners: [
    {
      name: 'Engage Education',
      subline: 'Teaching recruiter · United Kingdom',
      notes:
        'Engage Education has a South Africa-specific arm and places SA teachers into UK secondary schools (including maths roles). They handle CoS sponsorship for shortage-subject candidates.',
      url: 'https://engage-education.com/za/',
    },
    {
      name: 'Apostil.co.za',
      subline: 'Document concierge · Australia, United Kingdom, Canada, New Zealand, UAE',
      notes:
        'DIRCO-registered document concierge. Wednesday batch submissions to DIRCO mean a 1 to 2 week turnaround vs the public 3 to 4 week courier wait.',
      url: 'https://apostil.co.za/',
    },
  ],
};

async function main() {
  const element = React.createElement(ReportTemplate, { data }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);
  const outDir = join(process.cwd(), 'docs/prompt-tests');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'step4-template-fixture.pdf');
  writeFileSync(outPath, buffer);
  console.log('wrote', outPath, `(${buffer.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
