import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import CVSection from '@/components/CVSection';
import TableOfContents from '@/components/TableOfContents';
import { getPathwayContent } from '@/lib/pathway-content';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function MembersPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data: tokenRow } = await supabase
    .from('member_tokens')
    .select('id, lead_id, interest_category, accessed_at')
    .eq('token', token)
    .single();

  if (!tokenRow) notFound();

  if (!tokenRow.accessed_at) {
    await supabase
      .from('member_tokens')
      .update({ accessed_at: new Date().toISOString() })
      .eq('id', tokenRow.id);
  }

  const pathway = getPathwayContent(tokenRow.interest_category);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between"
        style={{ backgroundColor: '#1B4D3E' }}
      >
        <a href="/" className="flex items-center text-[1.4em]">
          <span className="font-body font-bold" style={{ color: '#F8F5F0' }}>job</span>
          <span className="font-body font-bold" style={{ color: '#C9A84C' }}>abroad</span>
        </a>
        <div className="flex items-center gap-3">
          <a
            href="#cv"
            className="font-body text-xs font-semibold rounded-lg px-3 py-1.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#F8F5F0' }}
          >
            My CV
          </a>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs font-semibold rounded-lg px-3 py-1.5"
            style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
          >
            WhatsApp us
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
        {pathway ? (
          /* Two-column on desktop: sticky TOC left, article right */
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 lg:items-start">

            {/* Desktop TOC — sticky left sidebar */}
            <aside
              className="hidden lg:block sticky top-20 self-start rounded-2xl p-5"
              style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
            >
              <TableOfContents items={pathway.toc} />
            </aside>

            {/* Main content */}
            <div className="flex flex-col gap-10 min-w-0">
              {/* sanitizeHtml in getPathwayContent ensures this is safe to render */}
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
                  prose-td:text-[#2C2C2C]
                  prose-blockquote:border-l-[#C9A84C] prose-blockquote:text-[#6B6B6B]
                  prose-hr:border-[#EDE8E0]"
                dangerouslySetInnerHTML={{ __html: pathway.html }}
              />

              <div id="cv">
                <CVSection
                  leadId={tokenRow.lead_id}
                  token={token}
                  whatsappNumber={whatsappNumber}
                />
              </div>

              {/* Mobile TOC — collapsible, below article */}
              <div
                className="lg:hidden rounded-2xl p-5"
                style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
              >
                <TableOfContents items={pathway.toc} />
              </div>

              <footer className="text-center font-body text-xs pb-6" style={{ color: '#6B6B6B' }}>
                We are an information service and CV toolkit. We do not place candidates or act as recruiters. We do not guarantee employment.
              </footer>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <ComingSoon
              category={tokenRow.interest_category}
              whatsappNumber={whatsappNumber}
            />
            <CVSection
              leadId={tokenRow.lead_id}
              token={token}
              whatsappNumber={whatsappNumber}
            />
          </div>
        )}
      </div>
    </main>
  );
}

function ComingSoon({
  category,
  whatsappNumber,
}: {
  category: string;
  whatsappNumber: string;
}) {
  const label = category.replace(/-/g, ' ');
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I paid for the ${label} pathway guide. When will it be ready?`)}`;

  return (
    <div
      className="rounded-2xl p-8 text-center flex flex-col gap-4"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
    >
      <h1
        className="font-display font-bold uppercase tracking-wide text-xl"
        style={{ color: '#2C2C2C' }}
      >
        Your guide is on its way
      </h1>
      <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
        The{' '}
        <strong style={{ color: '#2C2C2C', textTransform: 'capitalize' }}>{label}</strong>{' '}
        pathway guide is being finalised. WhatsApp us and we will send you what we have now —
        plus notify you the moment the full guide is ready.
      </p>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-display font-bold uppercase text-sm tracking-wide self-center"
        style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
      >
        WhatsApp us now
      </a>
    </div>
  );
}
