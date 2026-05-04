interface Props {
  token: string;
  isSubmitted: boolean;
}

export default function AssessmentCTA({ token, isSubmitted }: Props) {
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
          {isSubmitted ? 'Your Eligibility Assessment' : 'Start Your Eligibility Assessment'}
        </h2>
        <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {isSubmitted
            ? 'You have completed your assessment. Update it any time your situation changes.'
            : 'Answer 6 short sections so we can assess your readiness and send you a personalised action plan.'}
        </p>
      </div>
      <a
        href={`/members/${token}/assessment`}
        className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-display font-bold uppercase text-sm tracking-wide self-start"
        style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
      >
        {isSubmitted ? 'Update Assessment' : 'Start Assessment'}
      </a>
    </div>
  );
}
