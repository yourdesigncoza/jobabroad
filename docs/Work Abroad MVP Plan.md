---
title: Work Abroad MVP Plan
date: 2026-05-01
tags:
  - ai-business/work-abroad
  - mvp
  - implementation
status: active
---

# Work Abroad MVP — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> **2026-05-15 — CV scope dropped.** Sections in this plan that describe CV upload, CV templates, CV builder, the `cvs` Supabase bucket, `components/CVSection.tsx`, and `app/api/cv/*` are **no longer in scope**. We do not offer CV as a service. Treat all CV-related references in this doc as historical only — do not implement them.

**Goal:** Launch a single-page work-abroad lead generation site with interest-based WhatsApp intake and a R199 PayShap-gated members area serving pathway guides + eligibility assessment.

**Architecture:** Static Next.js landing page captures interest via category selector, pre-filling WhatsApp messages so users always initiate contact (free service conversations). After human-in-the-loop drip via WhatsApp Business App, John sends a PayShap Request to Pay. On payment confirmation, John uses a simple admin tool to generate and send a unique member link. The members area is a token-gated Next.js route backed by Supabase.

**Tech Stack:** Next.js 14 (App Router), Vercel (free tier), Supabase (free tier), Tailwind CSS, WhatsApp Business App (manual), PayShap (manual Request to Pay)

---

## Full Flow

```
Pamphlet / Sticker (QR code — unique per location batch)
  ↓
Landing page — hook headline + interest category selector
  ↓
Tap category → WhatsApp opens with pre-filled message
"Hi, I'm interested in [Farming/Agriculture] work abroad. Can you help me?"
  ↓
John receives → John replies with pre-written drip templates
(drip: tease info, build trust, address scam fears, qualify interest)
  ↓
When ready → John sends PayShap Request to Pay (R199) in WhatsApp
  ↓
Person pays → John opens /admin → generates unique member link → sends via WhatsApp
  ↓
Member area — structured pathway info + CV upload + CV builder → downloadable PDF
```

---

## Legal Requirements (Before First Sale)

Two SA legal obligations — both are simple to implement:

**1. POPIA (Protection of Personal Information Act)**
You are collecting phone numbers and CVs. Before any data is stored:
- Add a footer on the landing page: "We respect your privacy. [Privacy Policy]"
- First WhatsApp reply includes: "By continuing, you agree that we may contact you with work-abroad information. Reply STOP at any time to opt out."
- Create a one-page Privacy Policy — hosted at `/privacy`

**2. Employment Services Act**
It is illegal in SA to charge job seekers a placement/recruitment fee. If the Department of Labour classifies this as a recruitment agency, you face fines.
- Landing page footer: "We are an information service and CV toolkit. We do not place candidates or act as recruiters. We do not guarantee employment."
- Same disclaimer in WhatsApp drip messages and the members area.
- This is your protection. It is also true — lean into it as a trust signal.

---

## Phase 1 — Project Setup

### Task 1: Bootstrap Next.js project

**Files:**
- Create: `work-abroad-web/` (new Next.js project)

**Step 1: Create the project**
```bash
npx create-next-app@latest work-abroad-web --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd work-abroad-web
```

**Step 2: Install dependencies**
```bash
npm install @supabase/supabase-js @supabase/ssr @react-pdf/renderer lucide-react
```

**Step 3: Push to GitHub**
Create repo: `github.com/yourdesigncoza/work-abroad-web`
```bash
git remote add origin git@github.com:yourdesigncoza/work-abroad-web.git
git push -u origin main
```

**Step 4: Connect to Vercel**
- Import repo in Vercel dashboard
- Deploy to preview — confirm build passes

---

### Task 2: Supabase setup

**Files:**
- Create: `supabase/schema.sql`

**Step 1: Create Supabase project at supabase.com**
Note your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Step 2: Run schema**
```sql
-- People who contacted via WhatsApp
create table leads (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  interest_category text not null,
  created_at timestamptz default now()
);

-- Unique member links (generated after PayShap payment confirmed)
create table member_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null default gen_random_uuid()::text,
  lead_id uuid references leads(id),
  interest_category text not null,
  created_at timestamptz default now(),
  accessed_at timestamptz
);

-- CV submissions (upload or built)
create table cv_submissions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  type text check (type in ('upload', 'built')) not null,
  storage_path text,
  cv_data jsonb,
  created_at timestamptz default now()
);
```

**Step 3: Enable Storage**
Create bucket: `cvs` (private)

**Step 4: Add env vars to Vercel**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=27XXXXXXXXX
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
ADMIN_SECRET=<random 32-char string>
```

**Commit:**
```bash
git add supabase/
git commit -m "feat: supabase schema"
```

---

## Content Architecture

**Decision: Obsidian → Next.js. No Quartz needed for Jobroad.**

Quartz is a renderer for public static wikis (see signaltrace.wiki). It has no authentication layer, so it cannot gate content behind payment. Next.js already handles rendering — Quartz would be a redundant dependency.

**Writing workflow:**
1. Write pathway guides in an Obsidian vault (plain `.md` files — same workflow as signaltrace)
2. Files live in the Next.js repo under `content/pathways/<category>.md`
3. Next.js reads and renders markdown using `next-mdx-remote` + `gray-matter`
4. `/members/[token]` resolves the token in Supabase → gets the category → loads the right `.md` file

**File structure:**
```
content/
  pathways/           ← gated, paid guides (one per category)
    nursing.md
    it-tech.md
    engineering.md
    teaching.md
    finance.md
    farming.md
    seasonal.md
    hospitality.md
    trades.md
    other.md
  guides/             ← optional free public teasers for SEO
    working-in-uk.md
    working-in-australia.md
```

**Source material already exists:**
`/home/laudes/zoot/projects/signaltrace-site/content/work-abroad-pathway-intelligence/`
contains a complete research corpus: country pages (UK, Ireland, Germany, Australia, Canada, NZ), occupation pathways (nurses, engineers, ICT, accountants, teachers), visa routes, scam patterns, and regulatory constraints. Use this as the primary reference when writing the paid guides.

**Why not Quartz:**
- Quartz = public static site, no token gating possible
- Next.js already renders markdown just as well with `next-mdx-remote`
- One domain, one codebase, one deployment

**Future public pages (SEO, free teasers):**
Add free preview pages at `/pathways/[slug]` sourced from the same `.md` files — no gate, serves as organic traffic and trust-building content. These share the same writing workflow and file format.

---

## Phase 2 — Pathway Content (Write This Before Building the Admin Tool)

Before any tech is built beyond the landing page, write pathway guides for all 10 categories as markdown files in `content/pathways/`. You cannot sell a link to an empty page.

Each `.md` file uses YAML frontmatter for structured fields and markdown body for prose. Content per guide must include: destinations, overview, document checklist, realistic costs, timeline, scam warnings, and legitimate routes.

**Write in Obsidian.** Open the `content/pathways/` directory as an Obsidian vault. Write each guide as a note. Commit the files to git when done — Vercel rebuilds automatically.

**Source material:** `/home/laudes/zoot/projects/signaltrace-site/content/work-abroad-pathway-intelligence/` — use the Occupation Pathways, Countries, Visa Routes, and Scam Patterns subdirectories as primary references.

**Also create:** A downloadable Word CV template (`public/cv-template.docx`) — a clean, simple CV format anyone can fill in on their phone using Google Docs. This replaces the CV builder.

---

## Phase 3 — Landing Page

### Task 3: Interest categories config

**Files:**
- Create: `lib/categories.ts`

```typescript
export const CATEGORIES = [
  { id: 'healthcare',  label: 'Healthcare',           emoji: '🏥', description: 'Nurses, caregivers, medical staff' },
  { id: 'it-tech',    label: 'IT / Tech',             emoji: '💻', description: 'Developers, engineers, IT support' },
  { id: 'engineering',label: 'Engineering',           emoji: '⚙️', description: 'Civil, mechanical, electrical' },
  { id: 'teaching',   label: 'Teaching',              emoji: '📚', description: 'Teachers, tutors, education staff' },
  { id: 'finance',    label: 'Finance',               emoji: '💼', description: 'Accountants, analysts, banking' },
  { id: 'farming',    label: 'Farming / Agriculture', emoji: '🌾', description: 'Seasonal farm work UK & USA' },
  { id: 'seasonal',   label: 'Carnival / Seasonal',   emoji: '🎡', description: 'J1 visa, amusement, events USA' },
  { id: 'hospitality',label: 'Hospitality',           emoji: '🍽️', description: 'Hotels, restaurants, tourism' },
  { id: 'trades',     label: 'Trades',                emoji: '🔧', description: 'Plumbers, electricians, builders' },
  { id: 'other',      label: 'Other',                 emoji: '✈️', description: "Something else? Tell us" },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

export function buildWhatsAppLink(categoryLabel: string, source?: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const message = encodeURIComponent(
    `Hi, I'm interested in ${categoryLabel} work abroad. Can you help me?`
  );
  const src = source ? `&utm_source=${encodeURIComponent(source)}` : '';
  return `https://wa.me/${phone}?text=${message}${src}`;
}
```

**Commit:**
```bash
git add lib/categories.ts
git commit -m "feat: interest categories config"
```

---

### Task 4: Landing page

**Files:**
- Modify: `app/page.tsx`
- Create: `components/InterestGrid.tsx`
- Create: `components/CategoryCard.tsx`

**components/CategoryCard.tsx:**
```tsx
interface Props {
  category: { label: string; emoji: string; description: string };
  href: string;
}
export default function CategoryCard({ category, href }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-200 hover:border-green-500 hover:shadow-md transition-all text-center"
    >
      <span className="text-3xl">{category.emoji}</span>
      <span className="font-semibold text-sm">{category.label}</span>
      <span className="text-xs text-gray-500">{category.description}</span>
    </a>
  );
}
```

**components/InterestGrid.tsx:**
```tsx
'use client';
import { CATEGORIES, buildWhatsAppLink } from '@/lib/categories';
import CategoryCard from './CategoryCard';

export default function InterestGrid({ source }: { source?: string }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {CATEGORIES.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          href={buildWhatsAppLink(cat.label, source)}
        />
      ))}
    </div>
  );
}
```

**app/page.tsx:**
```tsx
import InterestGrid from '@/components/InterestGrid';

export default function Home({ searchParams }: { searchParams: { src?: string } }) {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 py-16 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Your next job is overseas.<br />
          <span className="text-green-600">Let's find it.</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Real pathways. No scams. No guesswork. Clear information on how South
          Africans like you actually get working abroad — from nurses to farm workers.
        </p>
      </section>

      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <h2 className="text-center text-xl font-semibold text-gray-700 mb-8">
          What kind of work are you looking for?
        </h2>
        <InterestGrid source={searchParams.src} />
        <p className="text-center text-sm text-gray-400 mt-6">
          Tap your category → WhatsApp opens → we take it from there.
        </p>
      </section>

      <section className="bg-gray-50 px-6 py-10 text-center">
        <p className="text-gray-600 max-w-xl mx-auto">
          We give you <strong>information</strong>, not false promises. Every pathway
          we share comes from official government sources. We are not recruiters.
          We are not a job board. We help you know what is real.
        </p>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-gray-400 border-t">
        <p>We are an information service and CV toolkit. We do not place candidates or act as recruiters. We do not guarantee employment.</p>
        <p className="mt-1"><a href="/privacy" className="underline">Privacy Policy</a></p>
      </footer>
    </main>
  );
}
```

**Commit:**
```bash
git add app/page.tsx components/
git commit -m "feat: landing page with interest selector"
```

---

## Phase 3 — Admin Tool (Manual Payment Flow)

### Task 5: Admin page — generate member tokens

John opens this page after confirming a PayShap payment. No integration with PayShap needed.

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/api/admin/generate-token/route.ts`

**app/api/admin/generate-token/route.ts:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { secret, phone, category } = await req.json();
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: lead } = await supabase
    .from('leads')
    .upsert({ phone, interest_category: category }, { onConflict: 'phone' })
    .select()
    .single();

  const { data: token } = await supabase
    .from('member_tokens')
    .insert({ lead_id: lead.id, interest_category: category })
    .select()
    .single();

  return NextResponse.json({
    memberLink: `${process.env.NEXT_PUBLIC_BASE_URL}/members/${token.token}`,
  });
}
```

**app/admin/page.tsx:**
```tsx
'use client';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/categories';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('healthcare');
  const [link, setLink] = useState('');

  async function generate() {
    const res = await fetch('/api/admin/generate-token', {
      method: 'POST',
      body: JSON.stringify({ secret, phone, category }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    setLink(data.memberLink ?? data.error);
  }

  return (
    <div className="max-w-md mx-auto p-8 space-y-4">
      <h1 className="text-xl font-bold">Generate Member Link</h1>
      <input className="w-full border p-2 rounded" placeholder="Admin secret" type="password"
        value={secret} onChange={e => setSecret(e.target.value)} />
      <input className="w-full border p-2 rounded" placeholder="Customer phone e.g. 27821234567"
        value={phone} onChange={e => setPhone(e.target.value)} />
      <select className="w-full border p-2 rounded" value={category} onChange={e => setCategory(e.target.value)}>
        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      <button onClick={generate} className="w-full bg-green-600 text-white p-2 rounded font-semibold">
        Generate Link
      </button>
      {link && (
        <div className="bg-gray-50 p-3 rounded break-all">
          <p className="font-mono text-sm">{link}</p>
          <button onClick={() => navigator.clipboard.writeText(link)}
            className="mt-2 text-xs text-green-600 underline">Copy</button>
        </div>
      )}
    </div>
  );
}
```

**Commit:**
```bash
git add app/admin/ app/api/admin/
git commit -m "feat: admin token generator for manual payment flow"
```

---

## Phase 4 — Members Area

### Task 6: Pathway content + token-gated page

**Files:**
- Create: `lib/pathway-content.ts`
- Create: `app/members/[token]/page.tsx`

**lib/pathway-content.ts** (write one entry per category — example structure):
```typescript
export interface PathwayContent {
  title: string;
  destinations: string[];
  overview: string;
  documents: string[];
  costs: string;
  timeline: string;
  scamWarnings: string[];
  legitimateRoutes: string[];
}

export const PATHWAY_CONTENT: Record<string, PathwayContent> = {
  healthcare: {
    title: 'Healthcare Pathways',
    destinations: ['United Kingdom (NHS)', 'Australia', 'Ireland', 'UAE'],
    overview: 'SA nurses and healthcare workers are in high demand in the UK and Australia. The NHS has 39,000+ vacancies and actively recruits from South Africa.',
    documents: ['SANC registration certificate', 'Matric certificate', 'English test (IELTS or OET)', 'Police clearance', 'References from current employer'],
    costs: 'R8,000–R20,000 for application fees, English testing, and document apostilling.',
    timeline: '6–18 months from application to arrival.',
    scamWarnings: [
      'No legitimate employer asks for upfront recruitment fees.',
      'Verify any UK employer on the official NHS Jobs site.',
      'All UK sponsors must appear on the GOV.UK Licensed Sponsor Register.',
    ],
    legitimateRoutes: ['NHS Jobs — jobs.nhs.uk', 'NMC registration — nmc.org.uk', 'Sable International for full immigration support'],
  },
  farming: {
    title: 'Farming & Agricultural Work',
    destinations: ['United Kingdom', 'United States', 'Australia', 'New Zealand'],
    overview: 'The UK Seasonal Worker Scheme and USA J1 Agricultural visa are two of the most accessible legal routes for South Africans without formal qualifications.',
    documents: ['Valid SA passport', 'No criminal record', 'Medical fitness certificate', 'Basic English'],
    costs: 'R2,000–R6,000 for visa and travel preparation.',
    timeline: '2–4 months.',
    scamWarnings: [
      'Never pay a SA agent to "secure you a farm job" — legitimate UK scheme operators are licenced by the Home Office.',
      'USA J1 sponsors are listed at jvisaatwork.com.',
    ],
    legitimateRoutes: ['HOPS Labour (UK)', 'Pro-Force (UK)', 'USDA J1 Agricultural programme'],
  },
  seasonal: {
    title: 'Carnival & Seasonal Work (USA)',
    destinations: ['United States'],
    overview: 'The J1 Cultural Exchange Visa allows young South Africans to work at amusement parks, carnivals, ski resorts, and summer camps in the USA for up to 12 months.',
    documents: ['Valid SA passport (2+ years remaining)', 'DS-2019 form from a sponsor', 'Basic English', 'Proof of intent to return to SA'],
    costs: 'R5,000–R12,000 including visa fee, SEVIS fee, and flights.',
    timeline: '2–4 months.',
    scamWarnings: [
      'Only use State Department-designated J1 sponsors.',
      'Never pay placement fees before receiving a DS-2019 form.',
    ],
    legitimateRoutes: ['InterExchange — interexchange.org', 'CIEE — ciee.org', 'Work & Travel SA (local licensed agent)'],
  },
  // Add remaining 7 categories: it-tech, engineering, teaching, finance, hospitality, trades, other
};
```

**app/members/[token]/page.tsx:**
```tsx
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { PATHWAY_CONTENT } from '@/lib/pathway-content';
import CVSection from '@/components/CVSection';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function MembersPage({ params }: { params: { token: string } }) {
  const { data: tokenRow } = await supabase
    .from('member_tokens')
    .select('*, leads(*)')
    .eq('token', params.token)
    .single();

  if (!tokenRow) notFound();

  if (!tokenRow.accessed_at) {
    await supabase
      .from('member_tokens')
      .update({ accessed_at: new Date().toISOString() })
      .eq('id', tokenRow.id);
  }

  const content = PATHWAY_CONTENT[tokenRow.interest_category];

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      <h1 className="text-3xl font-bold">{content.title}</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Top Destinations</h2>
        <ul className="list-disc pl-5 space-y-1">{content.destinations.map(d => <li key={d}>{d}</li>)}</ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <p>{content.overview}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Documents You Will Need</h2>
        <ul className="list-disc pl-5 space-y-1">{content.documents.map(d => <li key={d}>{d}</li>)}</ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Realistic Costs</h2>
        <p>{content.costs}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Timeline</h2>
        <p>{content.timeline}</p>
      </section>

      <section className="bg-red-50 border border-red-200 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-red-700 mb-2">Scam Warnings</h2>
        <ul className="list-disc pl-5 space-y-1 text-red-800">
          {content.scamWarnings.map(s => <li key={s}>{s}</li>)}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Legitimate Routes</h2>
        <ul className="list-disc pl-5 space-y-1">{content.legitimateRoutes.map(r => <li key={r}>{r}</li>)}</ul>
      </section>

      <CVSection leadId={tokenRow.lead_id} token={params.token} />

      <div className="text-center pt-8 border-t">
        <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
          className="text-green-600 underline font-semibold">
          Need help? WhatsApp us
        </a>
      </div>
    </main>
  );
}
```

**Commit:**
```bash
git add app/members/ lib/pathway-content.ts
git commit -m "feat: token-gated members area with pathway content"
```

---

## Phase 5 — CV Features

### Task 7: CV upload + template download (no builder needed for MVP)

The CV builder is cut. Building a multi-step CV form is the most expensive part of this plan in dev time, and a downloadable Word template + manual review by John delivers higher perceived value for less effort.

**What the members area CV section does:**
1. Download a clean Word CV template (one click)
2. Upload their completed CV (PDF or Word)
3. John reviews the upload and sends feedback via WhatsApp

**Files:**
- Create: `public/cv-template.docx` — simple, clean CV template (create in Google Docs, export as .docx)
- Create: `components/CVSection.tsx`
- Create: `app/api/cv/upload/route.ts`

**app/api/cv/upload/route.ts:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const leadId = formData.get('leadId') as string;
  const token = formData.get('token') as string;

  const { data: tokenRow } = await supabase
    .from('member_tokens').select('lead_id').eq('token', token).single();
  if (!tokenRow || tokenRow.lead_id !== leadId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const path = `${leadId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('cvs').upload(path, file);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('cv_submissions').insert({ lead_id: leadId, type: 'upload', storage_path: path });
  return NextResponse.json({ success: true });
}
```

**components/CVSection.tsx (client component):**
```tsx
'use client';
import { useState } from 'react';

export default function CVSection({ leadId, token }: { leadId: string; token: string }) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('uploading');
    const form = new FormData();
    form.append('file', file);
    form.append('leadId', leadId);
    form.append('token', token);
    const res = await fetch('/api/cv/upload', { method: 'POST', body: form });
    setStatus(res.ok ? 'done' : 'error');
  }

  return (
    <section className="border rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold">Your CV</h2>

      <div>
        <p className="text-sm text-gray-600 mb-2">
          No CV yet? Download our free template, fill it in on your phone or computer, then upload it below.
        </p>
        <a href="/cv-template.docx" download
          className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          Download CV Template
        </a>
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-2">
          Already have a CV? Upload it here and we will review it and send you feedback via WhatsApp.
        </p>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload}
          className="text-sm" />
        {status === 'uploading' && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
        {status === 'done' && <p className="text-sm text-green-600 mt-1">Uploaded. We will review it and WhatsApp you feedback within 24 hours.</p>}
        {status === 'error' && <p className="text-sm text-red-600 mt-1">Upload failed. Please try again or WhatsApp us.</p>}
      </div>
    </section>
  );
}
```

**Commit:**
```bash
git add public/cv-template.docx components/CVSection.tsx app/api/cv/
git commit -m "feat: CV upload and template download"
```

> **CV builder (react-pdf):** Defer until WhatsApp conversations show that "I don't have a CV and can't use Word" is a real blocker for 3+ paying users. Do not build it before then.

---

## Phase 6 — QR Code Tracking

### Task 9: UTM source on landing page (already wired — just generate QR codes)

The `?src=` param is already read by `page.tsx` and passed through every WhatsApp link. Generate unique QR codes per batch at qr-code-generator.com:

```
https://yourdomain.com/?src=batch-001-main-street
https://yourdomain.com/?src=batch-002-campus
https://yourdomain.com/?src=batch-003-church
https://yourdomain.com/?src=batch-004-taxi-rank
```

Vercel Analytics (free tier) shows traffic per source automatically. Enable in Vercel dashboard → Analytics.

---

## Manual Payment Workflow (No Integration Required)

```
1. Person WhatsApps John (from landing page QR/button)
2. John drips content via WhatsApp Business App using pre-written templates (use WhatsApp Desktop on laptop for fast copy-paste from /admin)
3. John: "To get the full pathway guide + CV toolkit, pay R199 via PayShap to 082XXXXXXX"
4. Person pays → John gets instant PayShap bank notification
5. John opens /admin → enters their phone number + category → copies member link
6. John sends via WhatsApp: "Here is your full access link: https://yourdomain.com/members/abc123"
7. Person opens link → pathway info + CV template download + CV upload → John reviews CV + sends WhatsApp feedback
```

Zero integration. Zero monthly cost. Fully manual until volume makes it worth automating.

**Lost link recovery:** Add this to the landing page below the interest grid:
```
Already paid? Lost your link?
WhatsApp us: "I lost my link. My number is [your number]."
```
John resends the link manually from `/admin`. No extra tech needed.

**WhatsApp Desktop:** Install WhatsApp Desktop (web.whatsapp.com) on John's laptop. This makes it fast to copy-paste the member link from `/admin` straight into a WhatsApp chat without switching devices.

---

## Launch Checklist

**Legal (before first sale):**
- [ ] Privacy Policy page live at `/privacy`
- [ ] Landing page footer disclaimer: "information service, not a recruiter"
- [ ] First WhatsApp reply template includes opt-out line

**Tech:**
- [ ] Domain registered (short, catchy — something related to "work abroad" or "overseas jobs SA")
- [ ] Vercel project live with custom domain
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER` set to John's WhatsApp Business number
- [ ] Supabase schema deployed + `cvs` storage bucket created
- [ ] Pathway content written for all 10 categories in `lib/pathway-content.ts`
- [ ] CV Word template created and placed at `public/cv-template.docx`
- [ ] Admin secret configured and `/admin` tested end-to-end
- [ ] WhatsApp Desktop (web.whatsapp.com) set up on John's laptop
- [ ] Vercel Analytics enabled (free tier, enable in dashboard)

**Guerrilla marketing:**
- [ ] First small test batch (5–10 stickers) placed at one specific location before full print run
- [ ] First QR code batch generated — minimum 3 different `?src=` values (main-street, campus, taxi-rank)
- [ ] WhatsApp Business App installed — profile name, description, and profile photo set

**End-to-end test before going live:**
1. Scan QR code → landing page loads on mobile (test on 3G speed if possible)
2. Tap category card → WhatsApp opens with correct pre-filled message
3. John receives WhatsApp → sends drip reply
4. John opens `/admin` → generates member link → sends via WhatsApp
5. Member link opens → pathway content loads → CV template downloads → CV upload works
6. Lost-link recovery message → John resends link → works

---

## What This Deliberately Defers

Do not build these until 10 paying users confirm willingness to pay:

- PayShap API webhook (automate payment confirmation)
- WhatsApp Cloud API (automate drip sequences)
- CV builder (react-pdf multi-step form) — only if template is a real blocker
- Email capture or newsletter
- Social media marketing accounts
- Subscription tier (R99–R149/month alerts)
- Multiple language support

---

## Related Notes

- [[Work Abroad Pathway Intelligence]] — research base and validated wedges (legacy reference)
- [[work-abroad-plan]] — original complex plan (legacy, kept for reference)
- [[MVP Validation Plan]] — validation philosophy
- [[JackMiniAI Notes]] — simplicity principle this plan is built on
