import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import AssessmentCTA from '@/components/AssessmentCTA';
import PathwaySearch from '@/components/PathwaySearch';
import TableOfContents from '@/components/TableOfContents';
import StickyNav from '@/components/StickyNav';
import AccessBadge from '@/components/AccessBadge';
import { getPathwayContent } from '@/lib/pathway-content';
import { CATEGORIES } from '@/lib/categories';
import { requireProfile } from '@/lib/auth-guards';

export default async function MembersCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!CATEGORIES.some((c) => c.id === category)) notFound();

  const { user, profile } = await requireProfile(`/members/${category}`);
  if (!profile) redirect('/dashboard');

  const cat = CATEGORIES.find((c) => c.id === category);
  const categoryLabel = cat?.label ?? category;
  const audience = cat?.audience ?? 'South African work-abroad applicants';

  if (profile.category !== category) {
    const ownLabel =
      CATEGORIES.find((c) => c.id === profile.category)?.label ?? profile.category;
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
        <div className="max-w-md mx-auto px-6 py-20 flex flex-col gap-6">
          <h1
            className="font-display font-bold uppercase tracking-wide text-2xl"
            style={{ color: '#2C2C2C' }}
          >
            Different category access
          </h1>
          <p className="font-body" style={{ color: '#2C2C2C' }}>
            Your account is for the <strong>{ownLabel}</strong> guide. Access to other
            guides is not available.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/members/${profile.category}`}
              className="inline-flex items-center justify-center font-display uppercase tracking-wider text-sm font-semibold px-6 py-3 rounded-md"
              style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
            >
              Go to your guide →
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center font-body text-sm underline"
              style={{ color: '#1B4D3E' }}
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const pathway = getPathwayContent(category);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <StickyNav items={pathway?.toc ?? []} whatsappNumber={whatsappNumber} isSignedIn />

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
        {pathway ? (
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 lg:items-start">
            <aside
              className="hidden lg:block sticky top-20 self-start rounded-2xl p-5"
              style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
            >
              <TableOfContents
                items={pathway.toc}
                assessmentHref={`/members/${category}/assessment`}
              />
            </aside>

            <div className="flex flex-col gap-10 min-w-0">
              <AccessBadge
                categoryLabel={categoryLabel}
                createdAt={user.created_at ?? null}
              >
                <div className="flex flex-col gap-2">
                  <p
                    className="font-display font-bold uppercase tracking-wide text-xs"
                    style={{ color: '#B8902F' }}
                  >
                    Last checked: May 2026
                  </p>
                  <p className="font-body text-[13px] leading-snug" style={{ color: '#2C2C2C' }}>
                    This guide is for planning and research only. Visa fees, salary thresholds,
                    and eligibility rules change — always confirm with the official regulator,
                    employer, or immigration authority before paying anyone.
                  </p>
                  <p className="font-body text-[13px] leading-snug" style={{ color: '#2C2C2C' }}>
                    <strong>What this guide does not do:</strong> we do not apply for you,
                    guarantee employment, arrange visas, replace a licensed immigration
                    adviser, or verify your personal eligibility. It helps you understand
                    realistic pathways before spending money.
                  </p>
                </div>
              </AccessBadge>

              <PathwaySearch
                whatsappNumber={whatsappNumber}
                category={category}
              />

              {/* sanitizeHtml in getPathwayContent ensures pathway.html is safe to render. */}
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

              <AssessmentCTA category={category} isSubmitted={false} />

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
              categoryLabel={categoryLabel}
              createdAt={user.created_at ?? null}
            />
            <ComingSoon category={category} whatsappNumber={whatsappNumber} />
            <AssessmentCTA category={category} isSubmitted={false} />
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
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi, I'm registered for the ${label} pathway guide. When will it be ready?`,
  )}`;

  return (
    <div
      className="rounded-2xl p-8 text-center flex flex-col gap-4"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
    >
      <h1
        className="font-display font-bold uppercase tracking-wide text-xl"
        style={{ color: '#2C2C2C' }}
      >
        Your guide is being updated
      </h1>
      <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
        The{' '}
        <strong style={{ color: '#2C2C2C', textTransform: 'capitalize' }}>{label}</strong>{' '}
        guide has been updated with critical new information pertaining to your field.
        We apologise for the interruption — but it&apos;s important you get the latest,
        most up-to-date information. We will WhatsApp you the link within the next 12
        hours.
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
