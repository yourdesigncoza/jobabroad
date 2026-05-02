import WhatsAppIcon from './WhatsAppIcon';
import { ShieldCheck, AlertTriangle, Ban } from 'lucide-react';

const PILLARS = [
  {
    Icon: ShieldCheck,
    title: 'Official sources only',
    body: 'Every claim links to GOV.UK, State Department, Home Affairs, or equivalent official government portals. No blog posts. No hearsay.',
  },
  {
    Icon: AlertTriangle,
    title: 'Scam warnings included',
    body: 'Each Playbook includes a red-flag checklist of known scam patterns: fake recruiters, upfront fee fraud, fraudulent job offers.',
  },
  {
    Icon: Ban,
    title: 'No placement fees. Ever.',
    body: 'I charge for information, not for placing you in a job. Charging job seekers placement fees is illegal in South Africa. I never do.',
  },
] as const;

const QUESTIONS = [
  {
    q: 'What do I get for R199?',
    a: 'You get my Work Abroad Playbook for your field — researched, up to date and built around the questions scam recruiters hope you never ask. Inside: destination options, document checklist, realistic costs, visa route overview, scam red flags and legitimate contacts. Plus a CV template and direct WhatsApp feedback.',
  },
  {
    q: 'Are you a recruitment agency?',
    a: "No. Jobabroad is an information service. I provide clear information from official sources. I don't place candidates, charge placement fees or guarantee employment.",
  },
  {
    q: 'Is this legal in South Africa?',
    a: "Yes. I operate under South African law and comply with POPIA (Protection of Personal Information Act). I'm not required to register as a recruitment agency — I don't place candidates or earn referral fees.",
  },
  {
    q: "What if my job type isn't listed?",
    a: "Tap the \"Other\" tile. WhatsApp opens and you can tell me exactly what you do. I'll tell you straight whether a real overseas route exists for your field.",
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

        {/* Trust pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {PILLARS.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col gap-4 p-6 rounded-2xl"
              style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
            >
              <Icon size={28} color="#ff751f" strokeWidth={1.5} />
              <div>
                <p
                  className="font-display font-bold uppercase text-sm tracking-wide mb-2"
                  style={{ color: '#2C2C2C' }}
                >
                  {title}
                </p>
                <p className="font-body text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
                  {body}
                </p>
              </div>
            </div>
          ))}
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
              WhatsApp me. I reply to every message.
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
            WhatsApp Me
          </a>
        </div>
      </div>
    </section>
  );
}
