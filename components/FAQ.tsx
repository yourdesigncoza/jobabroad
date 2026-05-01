import WhatsAppIcon from './WhatsAppIcon';

const QUESTIONS = [
  {
    q: 'Are you a recruitment agency?',
    a: 'No. We are an information service and CV toolkit. We provide verified pathway information — we do not place candidates, charge placement fees, or guarantee employment. This is explicitly stated on every page.',
  },
  {
    q: 'What do I get for R199?',
    a: 'A full pathway guide for your chosen field: destination options, step-by-step document checklist, realistic costs, current visa route overview, scam red flags, and legitimate programme contacts. Plus CV upload and a downloadable CV template you can fill in on your phone.',
  },
  {
    q: 'Is this legal in South Africa?',
    a: 'Yes. We operate as an information service under South African law and comply with POPIA (Protection of Personal Information Act). We are not required to register as a private employment agency because we do not place candidates or earn referral fees from employers.',
  },
  {
    q: "What if my job type isn't listed?",
    a: "Tap the \"Other\" tile — WhatsApp opens and you can tell us exactly what you do. We'll let you know honestly whether a realistic overseas route exists for your situation.",
  },
] as const;

export default function FAQ() {
  return (
    <section style={{ backgroundColor: '#F8F5F0' }} className="px-6 py-16">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#C9A84C' }} />
            <span
              className="font-display text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: '#C9A84C' }}
            >
              Common questions
            </span>
          </div>
          <h2
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#2C2C2C' }}
          >
            Straight answers.
          </h2>
        </div>

        {/* Q&A grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {QUESTIONS.map((item) => (
            <div
              key={item.q}
              className="p-6 rounded-2xl"
              style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
            >
              <p
                className="font-display font-bold uppercase text-sm tracking-wide mb-3"
                style={{ color: '#1B4D3E' }}
              >
                {item.q}
              </p>
              <p className="font-body text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-8 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ backgroundColor: '#1B4D3E' }}
        >
          <div>
            <p
              className="font-display font-bold uppercase text-sm tracking-wide"
              style={{ color: '#F8F5F0' }}
            >
              Still have a question?
            </p>
            <p className="font-body text-xs mt-1" style={{ color: 'rgba(248,245,240,0.65)' }}>
              WhatsApp us directly — we reply to every message.
            </p>
          </div>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I have a question about Jobabroad.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-display font-bold uppercase text-xs tracking-wide px-5 py-3 rounded-full shrink-0 transition-all"
            style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
          >
            <WhatsAppIcon size={15} color="#FFFFFF" />
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  );
}
