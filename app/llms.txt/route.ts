import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';
import { CATEGORIES } from '@/lib/categories';
import { listPathwaySlugs } from '@/lib/pathway-content';
import { listRouteParams, getRoutePage } from '@/lib/route-content';
import { listGuideSlugs, getGuidePage } from '@/lib/guide-content';
import { listCompareSlugs, getComparePage } from '@/lib/compare-content';
import { getAllBlogPosts } from '@/lib/blog-content';

// Serves /llms.txt — a clean, structured map of the site for AI crawlers
// (ChatGPT, Perplexity, Google AI Overviews). Generated from live content so
// it never drifts from what is actually published.
export function GET(): Response {
  const lines: string[] = [];

  lines.push(`# ${SITE_NAME}`);
  lines.push(`> ${SITE_DESCRIPTION}`);
  lines.push('');
  lines.push(
    'Jobabroad helps South Africans find realistic, scam-free routes to work abroad. ' +
      'Content is organised as category pathway guides, specific role-and-country route ' +
      'pages, document guides, and articles.',
  );
  lines.push('');

  // Pillars
  const categoryLabel = (id: string) =>
    CATEGORIES.find(c => c.id === id)?.label ?? id;
  lines.push('## Pathway guides (by category)');
  for (const slug of listPathwaySlugs()) {
    lines.push(`- [${categoryLabel(slug)} work-abroad pathway](${SITE_URL}/pathways/${slug})`);
  }
  lines.push('');

  // Routes
  const routes = listRouteParams();
  if (routes.length) {
    lines.push('## Route pages (role + country)');
    for (const { role, country } of routes) {
      const page = getRoutePage(role, country);
      const title = page?.frontmatter.title ?? `${role} in ${country}`;
      lines.push(`- [${title}](${SITE_URL}/routes/${role}/${country})`);
    }
    lines.push('');
  }

  // Comparisons
  const compares = listCompareSlugs();
  if (compares.length) {
    lines.push('## Comparisons (which option to choose)');
    for (const slug of compares) {
      const page = getComparePage(slug);
      const title = page?.frontmatter.title ?? slug;
      lines.push(`- [${title}](${SITE_URL}/compare/${slug})`);
    }
    lines.push('');
  }

  // Guides
  const guides = listGuideSlugs();
  if (guides.length) {
    lines.push('## Document guides');
    for (const slug of guides) {
      const page = getGuidePage(slug);
      const title = page?.frontmatter.title ?? slug;
      lines.push(`- [${title}](${SITE_URL}/guides/${slug})`);
    }
    lines.push('');
  }

  // Blog
  const posts = getAllBlogPosts();
  if (posts.length) {
    lines.push('## Articles');
    for (const post of posts) {
      lines.push(`- [${post.frontmatter.title}](${SITE_URL}/blog/${post.slug})`);
    }
    lines.push('');
  }

  // Directory
  lines.push('## Browse');
  lines.push(`- [Directory — every guide, route and article](${SITE_URL}/directory)`);
  lines.push('');

  // Trust pages
  lines.push('## Trust & safety');
  lines.push(`- [Work-abroad scam warnings](${SITE_URL}/scam-warnings)`);
  lines.push(`- [Recruiter directory](${SITE_URL}/recruiters)`);
  lines.push('');

  lines.push('## Key facts');
  lines.push('- Audience: South Africans seeking work abroad.');
  lines.push('- We are an information service: we do not place candidates, act as recruiters, or guarantee employment.');
  lines.push('- All route guidance cites official government and regulator sources.');
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
