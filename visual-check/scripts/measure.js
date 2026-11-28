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
const [url, selA, selB] = positionals;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(values.width), height: Number(values.height) } });
await page.goto(url);
await waitForReady(page, values);
await page.waitForSelector(selA);

const result = await page.evaluate(([a, b]) => {
    const box = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
            x: r.x, y: r.y, w: r.width, h: r.height,
            margin: cs.margin, padding: cs.padding, gap: cs.gap, fontSize: cs.fontSize,
        };
    };
    const A = box(a);
    const B = b ? box(b) : null;
    const out = { a: A };
    if (B) {
        out.b = B;
        out.verticalGap = B.y - (A.y + A.h);
        out.horizontalGap = B.x - (A.x + A.w);
    }
    return out;
}, [selA, selB]);

console.log(JSON.stringify(result));
await browser.close();