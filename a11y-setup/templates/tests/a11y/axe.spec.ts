import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Fallback routes, used only when no built sitemap is found.
 * List one route per page template, not every blog post.
 */
const ROUTES: string[] = ['/'];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Sitemaps that common builds write, checked in order. */
const SITEMAPS = [
  'dist/sitemap-index.xml', // Astro + @astrojs/sitemap (static)
  'dist/client/sitemap-index.xml', // Astro + @astrojs/sitemap (server output)
  'dist/sitemap.xml',
  'out/sitemap.xml', // Next static export
  '.next/server/app/sitemap.xml.body', // Next app/sitemap.ts
  'public/sitemap.xml',
];

/** Cap so a huge sitemap doesn't turn CI into a crawl. Override with A11Y_MAX_ROUTES. */
const MAX_ROUTES = Number(process.env.A11Y_MAX_ROUTES ?? 200);

type Violation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

function readSitemap(file: string, seen = new Set<string>()): string[] {
  if (seen.has(file) || !fs.existsSync(file)) return [];
  seen.add(file);
  const xml = fs.readFileSync(file, 'utf8');
  const out: string[] = [];
  for (const [, loc] of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    const pathname = new URL(loc, 'http://localhost').pathname;
    if (pathname.endsWith('.xml')) {
      // Sitemap index entry: the child file sits next to the parent.
      out.push(...readSitemap(path.join(path.dirname(file), path.basename(pathname)), seen));
    } else {
      out.push(pathname);
    }
  }
  return out;
}

function getRoutes(): { routes: string[]; source: string } {
  for (const file of SITEMAPS) {
    const found = readSitemap(file);
    if (found.length) return { routes: [...new Set(found)].slice(0, MAX_ROUTES), source: file };
  }
  return { routes: ROUTES, source: 'ROUTES array' };
}

function summarize(route: string, violations: Violation[]): string {
  const lines = [`${violations.length} axe violation(s) on ${route}`];
  for (const v of violations) {
    lines.push('', `[${v.impact ?? 'n/a'}] ${v.id}: ${v.help}`, `  ${v.helpUrl}`);
    for (const node of v.nodes.slice(0, 5)) lines.push(`  - ${node.target.join(' ')}`);
    if (v.nodes.length > 5) lines.push(`  ...and ${v.nodes.length - 5} more`);
  }
  return lines.join('\n');
}

const { routes, source } = getRoutes();

test.describe(`axe WCAG 2.2 AA (routes from ${source})`, () => {
  for (const route of routes) {
    test(route, async ({ page }, testInfo) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        // .exclude('#third-party-embed') // only for markup you truly can't control
        .analyze();
      if (results.violations.length) {
        await testInfo.attach('axe-violations.json', {
          body: JSON.stringify(results.violations, null, 2),
          contentType: 'application/json',
        });
      }
      expect(results.violations.length, summarize(route, results.violations)).toBe(0);
    });
  }
});
