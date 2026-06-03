/**
 * Shared Schema.org JSON-LD builders. Keeps structured-data shapes identical
 * across every content page type (pathways, routes, comparisons, guides, blog)
 * so a fix or a Google spec change lands in one place.
 */

/** A question/answer pair — the shape every content frontmatter uses for FAQs. */
export interface Faq {
  q: string;
  a: string;
}

/**
 * FAQPage JSON-LD from a list of Q&A pairs. Returns null for an empty list so
 * callers can `{schema && <JsonLd data={schema} />}` without emitting an empty
 * FAQPage (which Google flags).
 */
export function faqPageSchema(faqs: Faq[]) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
