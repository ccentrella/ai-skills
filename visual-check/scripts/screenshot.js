import { createRequire } from 'node:module';

// Resolve Playwright from the project the script is run in, not the skill folder.
const require = createRequire(`${process.cwd()}/package.json`);
const { chromium } = require('playwright');

const [url, selector, out = 'shot.png'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
});
await page.goto(url);

if (selector) {
    await page.locator(selector).screenshot({ path: out });
} else {
    await page.screenshot({ path: out }); // viewport only, never fullPage
}
await browser.close();
console.log(out);