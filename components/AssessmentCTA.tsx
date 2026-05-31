import { PAYMENTS_ENABLED } from '@/lib/access';

interface Props {
  category: string;
  isSubmitted: boolean;
  /** Has full report access. When payments are shelved this is true for every
   *  registered user, so the "Go Premium" upsell branch never shows. */
  isPaid: boolean;
}

export default function AssessmentCTA({ category, isSubmitted, isPaid }: Props) {
  // Three states: never-submitted (start), submitted + no access (upsell —
  // payments-on only), submitted + full access (view the report).
  let title: string;
  let body: string;
  let buttonLabel: string;
  let href: string;

  if (!isSubmitted) {
    title = 'Start Your Eligibility Check';
    body = PAYMENTS_ENABLED
      ? 'Answer 6 short sections so we can assess your readiness and send you a personalised action plan.'
      : 'Answer 6 short sections to unlock your free personalised report and action plan.';
    buttonLabel = 'Start Eligibility Check';
    href = `/members/${category}/assessment`;
  } else if (!isPaid) {
    title = 'Unlock Your Full Report';
    body = "You've completed your check. Upgrade for a personalised action plan emailed immediately, your own Abroad assistant, and an optional 15-min review call.";
    buttonLabel = 'Go Premium';
    href = `/members/${category}/score`;
  } else {
    title = 'Your Report';
    body = PAYMENTS_ENABLED
      ? 'View your full assessment, download the PDF, book your call, or chat with your assistant from your dashboard.'
      : 'View your full assessment and download your personalised report from your dashboard.';
    buttonLabel = 'View Your Report';
    href = `/members/${category}/score`;
  }

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
          {title}
        </h2>
        <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {body}
        </p>
      </div>
      <a
        href={href}
        className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-display font-bold uppercase text-sm tracking-wide self-start"
        style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
      >
        {buttonLabel}
      </a>
    </div>
  );
}
