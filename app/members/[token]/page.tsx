import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import AssessmentCTA from '@/components/AssessmentCTA';
import BackToTop from '@/components/BackToTop';
import PathwaySearch from '@/components/PathwaySearch';
import TableOfContents from '@/components/TableOfContents';
import StickyNav from '@/components/StickyNav';
import AccessBadge from '@/components/AccessBadge';
import { getPathwayContent } from '@/lib/pathway-content';
import { CATEGORIES } from '@/lib/categories';

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
    .select('id, lead_id, interest_category, accessed_at, created_at')
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

  const { data: latestAssessment } = await supabase
    .from('assessments')
    .select('status')
    .eq('member_token_id', tokenRow.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const assessmentSubmitted = latestAssessment?.status === 'submitted';

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

  const category = CATEGORIES.find(c => c.id === tokenRow.interest_category);
  const categoryLabel = category?.label ?? tokenRow.interest_category;
  const audience = category?.audience ?? 'South African work-abroad applicants';

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      {/* Top bar */}
      <StickyNav items={pathway?.toc ?? []} whatsappNumber={whatsappNumber} />

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
        {pathway ? (
          /* Two-column on desktop: sticky TOC left, article right */
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 lg:items-start">

            {/* Desktop TOC — sticky left sidebar */}
            <aside
              className="hidden lg:block sticky top-20 self-start rounded-2xl p-5"
              style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
            >
              <TableOfContents items={pathway.toc} assessmentHref={`/members/${token}/assessment`} />
            </aside>

            {/* Main content */}
            <div className="flex flex-col gap-10 min-w-0">
              <AccessBadge
                token={token}
                categoryLabel={categoryLabel}
                createdAt={tokenRow.created_at}
              >
                <div className="flex flex-col gap-2">
                  <p
                    className="font-display font-bold uppercase tracking-wide text-xs"
                    style={{ color: '#B8902F' }}
                  >
                    Last checked: May 2026
                  </p>
                  <p
                    className="font-body text-[13px] leading-snug"
                    style={{ color: '#2C2C2C' }}
                  >
                    This guide is for planning and research only. Visa fees, salary thresholds,
                    and eligibility rules change — always confirm with the official regulator,
                    employer, or immigration authority before paying anyone.
                  </p>
                  <p
                    className="font-body text-[13px] leading-snug"
                    style={{ color: '#2C2C2C' }}
                  >
                    <strong>What this guide does not do:</strong> we do not apply for you,
                    guarantee employment, arrange visas, replace a licensed immigration
                    adviser, or verify your personal eligibility. It helps you understand
                    realistic pathways before spending money.
                  </p>
                </div>
              </AccessBadge>

              <PathwaySearch
                token={token}
                whatsappNumber={whatsappNumber}
                category={tokenRow.interest_category}
              />

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
                  prose-td:text-[#2C2C2C] prose-td:text-xs
                  prose-blockquote:border-l-[#C9A84C] prose-blockquote:text-[#6B6B6B]
                  prose-hr:border-[#EDE8E0]"
                dangerouslySetInnerHTML={{ __html: pathway.html }}
              />

              <AssessmentCTA token={token} isSubmitted={assessmentSubmitted} />

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
        ) : (
          <div className="flex flex-col gap-10">
            <AccessBadge
              token={token}
              categoryLabel={categoryLabel}
              createdAt={tokenRow.created_at}
            />
            <ComingSoon
              category={tokenRow.interest_category}
              whatsappNumber={whatsappNumber}
            />
            <AssessmentCTA token={token} isSubmitted={assessmentSubmitted} />
          </div>
        )}
      </div>
      <BackToTop />
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
        Your guide has been updated
      </h1>
      <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
        The{' '}
        <strong style={{ color: '#2C2C2C', textTransform: 'capitalize' }}>{label}</strong>{' '}
        guide has been updated with critical new information pertaining to your field.
        We apologise for the interruption — but it&apos;s important you get the latest, most
        up-to-date information. We will WhatsApp you the link within the next 12 hours.
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
