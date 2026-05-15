import type { Metadata } from 'next';

/** Canonical origin, no trailing slash. Falls back to the production domain. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://jobabroad.co.za'
).replace(/\/$/, '');

export const SITE_NAME = 'Jobabroad';

export const SITE_DESCRIPTION =
  'Real pathways to overseas work for South Africans. No scams. No guesswork. From nurses to farm workers.';

/**
 * Builds page-level metadata with a canonical URL and matching Open Graph /
 * Twitter tags. Pass the bare title — the "— Jobabroad" suffix is applied by
 * the root layout's title template, so it is only added manually to the OG /
 * Twitter titles here (those do not run through the template).
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = `${title} — ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: `${SITE_URL}${path}`,
    },
    twitter: {
      title: fullTitle,
      description,
    },
  };
}
