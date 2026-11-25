import { test, expect, type Page } from '@playwright/test';

/**
 * Keyboard test for the site's main flow (quote/contact form by default).
 * Fill in every TODO(a11y), then flip CONFIGURED to true.
 * Until then these tests are skipped, not failed.
 */
const CONFIGURED = false;

// TODO(a11y): page that hosts the flow.
const FLOW_URL = '/contact';

// TODO(a11y): the flow's focusable elements, in the order Tab should reach them.
const TAB_ORDER: string[] = ['#name', '#email', '#message', 'button[type="submit"]'];

// TODO(a11y): valid values for the form (selector -> value).
const VALID_INPUT: Record<string, string> = {
  '#name': 'Test Person',
  '#email': 'test@example.com',
  '#message': 'Testing keyboard submit.',
};

// TODO(a11y): a text input to press Enter in (not a textarea).
const SUBMIT_FROM = '#email';

// TODO(a11y): what appears after a successful submit.
const SUCCESS = '[role="status"]';

// TODO(a11y): button that opens a modal, and the modal. Leave MODAL_TRIGGER '' if there is none.
const MODAL_TRIGGER = '';
const MODAL = '[role="dialog"]';

const MAX_TABS = 60;

test.skip(!CONFIGURED, 'Fill in the TODO(a11y) selectors in keyboard.spec.ts, then set CONFIGURED = true');

async function tabTo(page: Page, selector: string) {
  const target = page.locator(selector).first();
  for (let i = 0; i < MAX_TABS; i++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error(`Never reached ${selector} after ${MAX_TABS} Tab presses`);
}

/**
 * Heuristic: focused element matches :focus-visible and has an outline or box-shadow.
 * If your design shows focus another way (border, background, :focus-within on a wrapper),
 * adjust this check rather than deleting it.
 */
async function expectFocusVisible(page: Page) {
  const info = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return { ok: false, why: 'nothing focused' };
    const s = getComputedStyle(el);
    const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
    const shadow = s.boxShadow !== 'none';
    const r = el.getBoundingClientRect();
    return {
      ok: el.matches(':focus-visible') && (outline || shadow) && r.width > 0 && r.height > 0,
      why: `<${el.tagName.toLowerCase()}> outline: ${s.outlineStyle} ${s.outlineWidth}; box-shadow: ${s.boxShadow}`,
    };
  });
  expect(info.ok, `Focus indicator not visible on ${info.why}`).toBe(true);
}

test('Tab order follows the flow and focus is always visible', async ({ page }) => {
  await page.goto(FLOW_URL);
  await tabTo(page, TAB_ORDER[0]);
  await expectFocusVisible(page);
  for (const selector of TAB_ORDER.slice(1)) {
    await page.keyboard.press('Tab');
    await expect(page.locator(selector).first()).toBeFocused();
    await expectFocusVisible(page);
  }
});

test('Enter submits the form', async ({ page }) => {
  // TODO(a11y): stub the backend so tests never send real submissions.
  // await page.route('**/api/contact', (route) => route.fulfill({ status: 200, body: '{}' }));
  await page.goto(FLOW_URL);
  for (const [selector, value] of Object.entries(VALID_INPUT)) {
    await page.locator(selector).fill(value);
  }
  await page.locator(SUBMIT_FROM).press('Enter');
  await expect(page.locator(SUCCESS)).toBeVisible();
});

test('Escape closes the modal and returns focus to its trigger', async ({ page }) => {
  test.skip(!MODAL_TRIGGER, 'No modal configured');
  await page.goto(FLOW_URL);
  await tabTo(page, MODAL_TRIGGER);
  await page.keyboard.press('Enter');
  const modal = page.locator(MODAL);
  await expect(modal).toBeVisible();
  await expect.poll(() => modal.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  await expect(page.locator(MODAL_TRIGGER).first()).toBeFocused();
});
