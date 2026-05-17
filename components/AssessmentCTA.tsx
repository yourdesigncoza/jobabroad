interface Props {
  category: string;
  isSubmitted: boolean;
  isPaid: boolean;
}

export default function AssessmentCTA({ category, isSubmitted, isPaid }: Props) {
  // Three states: never-submitted (start), submitted + free (upsell to premium),
  // submitted + paid (view the unlocked report).
  let title: string;
  let body: string;
  let buttonLabel: string;
  let href: string;

  if (!isSubmitted) {
    title = 'Start Your Eligibility Check';
    body = 'Answer 6 short sections so we can assess your readiness and send you a personalised action plan.';
    buttonLabel = 'Start Eligibility Check';
    href = `/members/${category}/assessment`;
  } else if (!isPaid) {
    title = 'Unlock Your Full Report';
    body = "You've completed your check. Upgrade to see your full personalised assessment, book a 15-min review call, and get 5 follow-up questions.";
    buttonLabel = 'Go Premium';
    href = `/members/${category}/score`;
  } else {
    title = 'Your Premium Report';
    body = 'View your full assessment, download the PDF, book your call, or send a follow-up from your dashboard.';
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
