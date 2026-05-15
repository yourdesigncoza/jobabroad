import type { Metadata } from 'next';

/** Canonical origin, no trailing slash. Falls back to the production domain. */
export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://jobabroad.co.za')
  .trim()
  .replace(/\/+$/, '');

export const SITE_NAME = 'Jobabroad';

export const SITE_DESCRIPTION =
  'Real pathways to overseas work for South Africans. No scams. No guesswork. From nurses to farm workers.';

/** Brand "author" used on every page's author / article:author meta. */
export const SITE_AUTHOR = SITE_NAME;

/** Dimensions of the share card emitted by app/opengraph-image.tsx (and per-route variants). */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_TYPE = 'image/png';

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  /** Defaults to 'website'. Use 'article' for guide / news / dated content. */
  type?: 'website' | 'article';
  /** Required when type === 'article'. */
  publishedTime?: Date;
  /** Optional override for the OG image alt text. */
  imageAlt?: string;
}

/**
 * Builds page-level metadata with a canonical URL, matching Open Graph /
 * Twitter tags, and brand-wide author defaults. The bare `title` is passed —
 * the "— Jobabroad" suffix is applied by the root layout's title template,
 * so it is only added manually to the OG / Twitter titles here (those do not
 * run through the template).
 */
export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  publishedTime,
  imageAlt,
}: PageMetadataInput): Metadata {
  const fullTitle = `${title} — ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;
  const alt = imageAlt ?? `${SITE_NAME}: ${title}`;

  const openGraph: NonNullable<Metadata['openGraph']> =
    type === 'article'
      ? {
          title: fullTitle,
          description,
          url,
          type: 'article',
          siteName: SITE_NAME,
          locale: 'en_ZA',
          authors: [SITE_AUTHOR],
          ...(publishedTime ? { publishedTime: publishedTime.toISOString() } : {}),
        }
      : {
          title: fullTitle,
          description,
          url,
          type: 'website',
          siteName: SITE_NAME,
          locale: 'en_ZA',
        };

  return {
    title,
    description,
    authors: [{ name: SITE_AUTHOR }],
    alternates: { canonical: path },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [{ url: `${url}/opengraph-image`, alt, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }],
    },
  };
}
