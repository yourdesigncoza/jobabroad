/**
 * Renders a <script type="application/ld+json"> tag for structured data.
 *
 * The `data` argument is JSON-stringified server-side and `<` is escaped to
 * its unicode form to prevent a </script> breakout. Callers MUST pass only
 * server-controlled content (constants, codebase-derived values, file
 * metadata) — never user input.
 */
export default function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
