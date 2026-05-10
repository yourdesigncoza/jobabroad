import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BackToTop from '@/components/BackToTop';
import PathwaySearch from '@/components/PathwaySearch';
import TableOfContents from '@/components/TableOfContents';
import StickyNav from '@/components/StickyNav';
import { getPathwayContent } from '@/lib/pathway-content';
import { CATEGORIES, buildWhatsAppLink } from '@/lib/categories';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DemoPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const categoryDef = CATEGORIES.find(c => c.id === category);
  const pathway = categoryDef ? getPathwayContent(category) : null;

  if (!categoryDef || !pathway) notFound();

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const categoryLabel = categoryDef.label;
  const audience = categoryDef.audience;
  const waLink = buildWhatsAppLink(categoryLabel, `demo-${category}`);

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <StickyNav items={pathway.toc} whatsappNumber={whatsappNumber} />

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 lg:items-start">

          <aside
            className="hidden lg:block sticky top-20 self-start rounded-2xl p-5"
            style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
          >
            <TableOfContents items={pathway.toc} />
          </aside>

          <div className="flex flex-col gap-10 min-w-0">
            <DemoBanner categoryLabel={categoryLabel} waLink={waLink} />

            <PathwaySearch
              demoCategory={category}
              whatsappNumber={whatsappNumber}
              category={category}
            />

            {/* Sanitized in getPathwayContent — same pipeline as /members/[token] */}
            <article
              className="prose prose-sm sm:prose-base max-w-none
                prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wide
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base
                prose-headings:text-[#2C2C2C]
                prose-p:text-[#2C2C2C] prose-p:font-body
                prose-li:text-[#2C2C2C] prose-li:font-body
                prose-a:text-[#1B4D3E] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-[#2C2C2C]
                prose-table:text-sm
                prose-th:bg-[#EDE8E0] prose-th:text-[#2C2C2C]
                prose-td:text-[#2C2C2C] prose-td:text-xs
                prose-blockquote:border-l-[#C9A84C] prose-blockquote:text-[#6B6B6B]
                prose-hr:border-[#EDE8E0]"
              dangerouslySetInnerHTML={{ __html: pathway.html }}
            />

            <DemoUnlockCTA categoryLabel={categoryLabel} waLink={waLink} />

            <footer
              className="border-t pt-6 pb-8 flex flex-col gap-4 font-body text-xs leading-relaxed"
              style={{ color: '#6B6B6B', borderColor: '#EDE8E0' }}
            >
              <p>© {new Date().getFullYear()} Jobabroad. All rights reserved.</p>
              <p>
                <strong style={{ color: '#2C2C2C' }}>Disclaimer:</strong>{' '}
                This is general information about work-abroad pathways for {audience}. It does not constitute immigration advice and is not tailored to your individual circumstances. For advice about your specific situation, consult a licensed immigration adviser or attorney in the relevant country.
              </p>
              <p>
                We are an information service. We do not place candidates or act as recruiters, and we do not guarantee employment.
              </p>
            </footer>
          </div>
        </div>
      </div>
      <BackToTop />
    </main>
  );
}

function DemoBanner({ categoryLabel, waLink }: { categoryLabel: string; waLink: string }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E0' }}
    >
      <div style={{ height: 3, backgroundColor: '#C9A84C' }} aria-hidden />

      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span
          className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1 font-display font-bold uppercase text-xs tracking-wide"
          style={{ backgroundColor: '#EDE8E0', color: '#1B4D3E' }}
        >
          <span aria-hidden>👁</span>
          Preview — {categoryLabel}
        </span>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-display font-bold uppercase text-xs tracking-wide self-start sm:self-auto"
          style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
        >
          Get your own access
        </a>
      </div>

      <div style={{ height: 1, backgroundColor: '#EDE8E0' }} aria-hidden />

      <div className="px-5 py-4 flex flex-col gap-2">
        <p
          className="font-display font-bold uppercase tracking-wide text-xs"
          style={{ color: '#B8902F' }}
        >
          Last checked: May 2026
        </p>
        <p className="font-body text-[13px] leading-snug" style={{ color: '#2C2C2C' }}>
          This is a public preview of the {categoryLabel.toLowerCase()} guide — search included.
          The eligibility check and personal CV upload unlock once you have your own access link.
          Daily preview searches are limited; tap <strong>Get your own access</strong> to remove limits.
        </p>
        <p className="font-body text-[13px] leading-snug" style={{ color: '#2C2C2C' }}>
          <strong>What this guide does not do:</strong> we do not apply for you, guarantee
          employment, arrange visas, replace a licensed immigration adviser, or verify your
          personal eligibility. It helps you understand realistic pathways before spending money.
        </p>
      </div>
    </div>
  );
}

function DemoUnlockCTA({ categoryLabel, waLink }: { categoryLabel: string; waLink: string }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{ backgroundColor: '#1B4D3E' }}
    >
      <div className="flex flex-col gap-1">
        <h2
          className="font-display font-bold uppercase tracking-wide text-base"
          style={{ color: '#F8F5F0' }}
        >
          Ready for your own {categoryLabel} pathway?
        </h2>
        <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Get the full guide plus the eligibility check, semantic search across our research vault,
          and a CV toolkit tailored to your destination.
        </p>
      </div>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-display font-bold uppercase text-sm tracking-wide self-start"
        style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
      >
        Start on WhatsApp
      </a>
    </div>
  );
}
