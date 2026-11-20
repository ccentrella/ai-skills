---
name: visual-check
description: Inspect the frontend cheaply by measuring, taking cropped screenshots, and calling CLI only when needed. Use whenever the user asks about spacing, alignment, sizes, how a component looks, or whether a UI change worked. 
---

# Frontend visual checks (token-efficient)

Start with the cheapest tool that answers the question.

## Order of tools

1. **Numbers (spacing, size, alignment, overflow):** run `scripts/measure.js`. Never use a screenshot to estimate pixels.
2. **Look and feel (balance, hierarchy, clipping):** run `scripts/screenshot.js` on ONE component, then read the saved image.
3. **Interaction flows (click through states, forms, menus):** use Playwright CLI.
4. **Console errors, network failures, performance:** use the `chrome-devtools` CLI.

If a flow needs a few clicks before measuring or screenshotting, add them to the script (e.g. `await page.click('.menu')`) so it stays deterministic.

## Rules

- Make sure the dev server is running before any script.
- Screenshots: crop to a selector, viewport only, `deviceScaleFactor: 1`. Never use fullPage.
- Do not screenshot after every edit. One check at the end of a change.
- Save images to disk and read them only when needed.
- Playwright library must be installed in the project: `npm i -D playwright` then `npx playwright install chromium`.
- With `chrome-devtools`, start it with `--workspace=<project path>` and run `chrome-devtools stop` when finished.
- When an escalation tool figures out something repeatable (a login sequence, a tricky selector), fold it into the scripts.

## Available scripts

- **`scripts/measure.js`**: Measures the distance between two elements, or one element's box and spacing styles. Usage: `node scripts/measure.js <url> "<selectorA>" "<selectorB>"`. With only selector A, it returns that element's box and spacing styles.
- **`scripts/screenshot.js`**: Takes a screenshot of a page or element. Usage: `node scripts/screenshot.js <url> "<selector>" <out.png>`. Omit the selector for a viewport-only shot.