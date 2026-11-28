import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { waitForReady } from './wait.js';

// Resolve Playwright from the project the script is run in, not the skill folder.
const require = createRequire(`${process.cwd()}/package.json`);
const { chromium } = require('playwright');

const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { wait: { type: 'string' }, settled: { type: 'boolean' }, width: { type: 'string', default: '1280' }, height: { type: 'string', default: '800' } },
});
const [url, selector, out = 'shot.png'] = positionals;
const browser = await chromium.launch();
const page = await browser.newPage({
    viewport: { width: Number(values.width), height: Number(values.height) },
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