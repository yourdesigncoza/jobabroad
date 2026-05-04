import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import StickyNav from '@/components/StickyNav';
import AssessmentWizard from '@/components/AssessmentWizard';
import BackToTop from '@/components/BackToTop';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

  const { data: tokenRow } = await supabase
    .from('member_tokens')
    .select('id, lead_id, interest_category')
    .eq('token', token)
    .single();

  if (!tokenRow) notFound();

  const { data: lead } = await supabase
    .from('leads')
    .select('phone')
    .eq('id', tokenRow.lead_id)
    .single();

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('member_token_id', tokenRow.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <StickyNav items={[]} whatsappNumber={whatsappNumber} />

      <div className="max-w-lg mx-auto px-4 py-10">
        <a
          href={`/members/${token}`}
          className="inline-flex items-center gap-1 font-body text-sm mb-8"
          style={{ color: '#6B6B6B' }}
        >
          ← Back to guide
        </a>

        <div className="flex flex-col gap-2 mb-8">
          <h1
            className="font-display font-bold uppercase tracking-wide text-2xl"
            style={{ color: '#2C2C2C' }}
          >
            Eligibility Assessment
          </h1>
          <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
            Your answers help us assess your readiness and identify your next steps.
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
        >
          <AssessmentWizard
            token={token}
            memberTokenId={tokenRow.id}
            whatsappNumber={whatsappNumber}
            initialData={(assessment?.data as Record<string, unknown>) ?? {}}
            initialSlugs={(assessment?.completed_step_slugs as string[]) ?? []}
            initialAssessmentId={assessment?.id ?? null}
            initialStatus={(assessment?.status as 'draft' | 'submitted') ?? null}
            leadPhone={lead?.phone ?? ''}
          />
        </div>
      </div>
      <BackToTop />
    </main>
  );
}
