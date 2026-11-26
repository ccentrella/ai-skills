import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { waitForReady } from './wait.js';

// Resolve Playwright from the project the script is run in, not the skill folder.
const require = createRequire(`${process.cwd()}/package.json`);
const { chromium } = require('playwright');

const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { wait: { type: 'string' }, settled: { type: 'boolean' } },
});
const [url, selector, out = 'shot.png'] = positionals;
const browser = await chromium.launch();
const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
});
await page.goto(url);
await waitForReady(page, values);

if (selector) {
    await page.locator(selector).screenshot({ path: out });
} else {
    await page.screenshot({ path: out }); // viewport only, never fullPage
}
await browser.close();
console.log(out);