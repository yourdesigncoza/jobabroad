import type { Faq } from '@/lib/schema';

/**
 * The visible "Frequently asked questions" block, rendered identically on every
 * content page type. Pair with `faqPageSchema()` for the matching FAQPage JSON-LD.
 * Renders nothing when there are no FAQs. The `id="faq"` anchor matches the TOC
 * entry pages add when FAQs are present.
 */
export default function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section id="faq" className="flex flex-col gap-4 scroll-mt-24">
      <h2
        className="font-display font-bold uppercase tracking-wide text-xl"
        style={{ color: '#2C2C2C' }}
      >
        Frequently asked questions
      </h2>
      {faqs.map(faq => (
        <div
          key={faq.q}
          className="rounded-xl p-5 flex flex-col gap-2"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E0' }}
        >
          <h3 className="font-display font-bold text-base" style={{ color: '#2C2C2C' }}>
            {faq.q}
          </h3>
          <p className="font-body text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
            {faq.a}
          </p>
        </div>
      ))}
    </section>
  );
}
