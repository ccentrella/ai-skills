import { test, expect } from '@playwright/test';

/**
 * Key pages whose screen-reader structure shouldn't change by accident.
 * One per page template. When a change is intentional, refresh baselines with:
 *   <run> test:a11y --update-snapshots
 * and review the .aria.yml diff in the PR.
 */
const KEY_PAGES: string[] = ['/'];

// 'body' also catches nav/footer changes. Switch to 'main' if those are noisy.
const ROOT = 'body';

const slug = (route: string) =>
  route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-');

for (const route of KEY_PAGES) {
  test(`aria snapshot: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator(ROOT)).toMatchAriaSnapshot({ name: `${slug(route)}.aria.yml` });
  });
}
