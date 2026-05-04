interface Props {
  whatsappNumber: string;
  onStartNew: () => void;
}

export default function AssessmentConfirmation({ whatsappNumber, onStartNew }: Props) {
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I've completed my eligibility assessment. Looking forward to your feedback!")}`;
  return (
    <div className="flex flex-col gap-6 text-center">
      <div
        className="rounded-full w-16 h-16 flex items-center justify-center mx-auto"
        style={{ backgroundColor: 'rgba(27,77,62,0.1)' }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M6 16l7 7 13-13" stroke="#1B4D3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-display font-bold uppercase tracking-wide text-xl" style={{ color: '#2C2C2C' }}>
          Assessment Submitted
        </h2>
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          We have received your eligibility assessment. We will review it and WhatsApp you
          with personalised feedback within 1–2 business days.
        </p>
      </div>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-display font-bold uppercase text-sm tracking-wide"
        style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
      >
        Message us on WhatsApp
      </a>
      <button
        onClick={onStartNew}
        className="font-body text-xs underline"
        style={{ color: '#6B6B6B' }}
      >
        Update my assessment
      </button>
    </div>
  );
}
