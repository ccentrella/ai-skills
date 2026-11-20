import { chromium } from 'playwright';

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