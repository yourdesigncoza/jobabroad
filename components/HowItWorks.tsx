import { MessageCircle, FileText, Unlock } from 'lucide-react';

const STEPS = [
  {
    number: '1',
    icon: MessageCircle,
    title: 'Pick your field',
    description:
      'Tap a category tile on this page. WhatsApp opens with your choice pre-filled — no forms, no sign-up. Just a conversation.',
  },
  {
    number: '2',
    icon: FileText,
    title: 'Get real pathway information',
    description:
      'We send you verified, scam-free guidance for your specific situation — destinations, documents, costs, and red flags to avoid.',
  },
  {
    number: '3',
    icon: Unlock,
    title: 'Full access for R199',
    description:
      'When you\'re ready, unlock your complete pathway guide plus CV upload and a professional CV template — all in one place.',
  },
] as const;

export default function HowItWorks() {
  return (
    <section style={{ backgroundColor: '#FFFFFF' }} className="px-6 py-16">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#C9A84C' }} />
            <span
              className="font-display text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: '#C9A84C' }}
            >
              Simple process
            </span>
          </div>
          <h2
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#2C2C2C' }}
          >
            How it works.
          </h2>
          <p className="font-body text-sm mt-2 max-w-lg" style={{ color: '#6B6B6B' }}>
            No confusing forms. No upfront fees. Start with a free WhatsApp conversation.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex flex-col gap-4">

                {/* Number + icon row */}
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center rounded-full font-display font-bold text-lg shrink-0"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#1B4D3E',
                      color: '#F8F5F0',
                    }}
                  >
                    {step.number}
                  </div>
                  <Icon size={24} color="#C9A84C" strokeWidth={1.5} />
                </div>

                {/* Connector line (desktop only, between steps) */}
                <div
                  className="h-px w-full hidden"
                  style={{ backgroundColor: '#EDE8E0' }}
                />

                {/* Text */}
                <div>
                  <h3
                    className="font-display font-bold uppercase text-base tracking-wide mb-2"
                    style={{ color: '#2C2C2C' }}
                  >
                    {step.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
